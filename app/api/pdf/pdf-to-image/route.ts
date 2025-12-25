import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { createJob, updateJob } from "@/lib/jobStore";

// IMPORTANT: Use the exact renderer you already got working.
// If you’re using puppeteer, keep it. I’m showing placeholders where you plug your existing code.
import puppeteer from "puppeteer";

export const runtime = "nodejs"; // required for puppeteer in Next.js

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Create job immediately
    const job = createJob();

    // Start background work (still within request lifecycle for localhost)
    // For production we can offload to background worker.
    processJob(job.jobId, file).catch((err) => {
      updateJob(job.jobId, { status: "error", message: err.message || String(err) });
    });

    return NextResponse.json({ jobId: job.jobId });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to start conversion" },
      { status: 500 }
    );
  }
}

async function processJob(jobId: string, file: File) {
  updateJob(jobId, { status: "running", progress: 1, message: "Loading PDF..." });

  const pdfBuffer = Buffer.from(await file.arrayBuffer());
  const pdfDoc = await PDFDocument.load(pdfBuffer);
  const pageCount = pdfDoc.getPageCount();

  updateJob(jobId, { message: `Rendering ${pageCount} pages...`, progress: 5 });

  const zip = new JSZip();

  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    // Create a data URL so Chromium can render the PDF
    const base64Pdf = pdfBuffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

    const previews: { page: number; dataUrl: string }[] = [];

    for (let i = 1; i <= pageCount; i++) {
      // Update progress
      const pct = Math.round((i / pageCount) * 90); // keep some room for zipping
      updateJob(jobId, { progress: 5 + pct, message: `Rendering page ${i}/${pageCount}` });

      await page.goto(`${dataUrl}#page=${i}`, { waitUntil: "networkidle0" });

      // Use generic sleep (waitForTimeout may not exist depending on puppeteer version)
      await new Promise((r) => setTimeout(r, 150));

      const png = (await page.screenshot({
        type: "png",
        fullPage: true,
      })) as Buffer;

      const fileName = `page-${String(i).padStart(3, "0")}.png`;
      zip.file(fileName, png);

      // Add preview thumbnail for first 12 pages only (to avoid huge memory)
      if (i <= 12) {
        const dataUrlPng = `data:image/png;base64,${png.toString("base64")}`;
        previews.push({ page: i, dataUrl: dataUrlPng });
        updateJob(jobId, { previews });
      }
    }

    updateJob(jobId, { progress: 97, message: "Creating ZIP..." });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    updateJob(jobId, {
      progress: 100,
      status: "done",
      message: "Done",
      zipBase64: zipBuffer.toString("base64"),
      previews,
    });
  } finally {
    await browser.close();
  }
}
