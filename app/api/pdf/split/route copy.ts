import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;

  const bytes = await file.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);

  const outputs: Uint8Array[] = [];

  for (let i = 0; i < pdf.getPageCount(); i++) {
    const doc = await PDFDocument.create();
    const [page] = await doc.copyPages(pdf, [i]);
    doc.addPage(page);
    outputs.push(await doc.save());
  }

  return NextResponse.json({ pages: outputs.length });
}
