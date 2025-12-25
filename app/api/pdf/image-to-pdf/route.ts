import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export const runtime = "nodejs";

function assertImages(files: File[]) {
  if (!files?.length) throw new Error("No images uploaded");
  const max = 10;
  const maxBytes = 15_000_000; // 15MB total
  if (files.length > max) throw new Error(`Max ${max} images per request`);
  const total = files.reduce((s, f) => s + f.size, 0);
  if (total > maxBytes) throw new Error("Total upload too large (max 15MB)");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    assertImages(files);

    const pdf = await PDFDocument.create();

    for (const file of files) {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const type = (file.type || "").toLowerCase();

      let embedded;
      if (type.includes("png")) {
        embedded = await pdf.embedPng(bytes);
      } else if (type.includes("jpeg") || type.includes("jpg")) {
        embedded = await pdf.embedJpg(bytes);
      } else {
        throw new Error(`Unsupported image type: ${file.type || file.name}`);
      }

      const { width, height } = embedded.scale(1);
      const page = pdf.addPage([width, height]);
      page.drawImage(embedded, { x: 0, y: 0, width, height });
    }

    const out = await pdf.save();

    return new NextResponse(out, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="images.pdf"`,
      },
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Image to PDF failed" },
      { status: 400 }
    );
  }
}
