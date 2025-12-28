import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import puppeteer from "puppeteer";
import { createJob, updateJob } from "../../../../lib/jobStore"; // use relative import if @ alias isn't configured

export const runtime = "nodejs";

const getErrorMessage = (err: unknown) =>
  err instanceof Error ? err.message : String(err);

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const job = createJob();

    processJob(job.jobId, file).catch((err: unknown) => {
      updateJob(job.jobId, {
        status: "error",
        message: getErrorMessage(err),
      });
    });

    return NextResponse.json({ jobId: job.jobId });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(err) || "Failed to start conversion" },
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

  // ✅ Type-safe: headless boolean
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    const base64Pdf = pdfBuffer.toString("base64");
    const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

    const previews: { page: number; dataUrl: string }[] = [];

    for (let i = 1; i <= pageCount; i++) {
      const pct = Math.round((i / pageCount) * 90);
      updateJob(jobId, {
        progress: 5 + pct,
        message: `Rendering page ${i}/${pageCount}`,
      });

      await page.goto(`${dataUrl}#page=${i}`, { waitUntil: "networkidle0" });
      await sleep(150);

      const png = (await page.screenshot({
        type: "png",
        fullPage: true,
      })) as Buffer;

      zip.file(`page-${String(i).padStart(3, "0")}.png`, png);

      if (i <= 12) {
        previews.push({ page: i, dataUrl: `data:image/png;base64,${png.toString("base64")}` });
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
