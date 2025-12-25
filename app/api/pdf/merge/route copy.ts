import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  const form = await req.formData();
  const files = form.getAll("files") as File[];

  const merged = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => merged.addPage(p));
  }

  const out = await merged.save();

  return new NextResponse(out, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=merged.pdf",
    },
  });
}
