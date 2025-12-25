import { PDFDocument } from "pdf-lib";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file") as File;

  const pdf = await PDFDocument.load(await file.arrayBuffer());
  const compressed = await pdf.save({ useObjectStreams: false });

  return new NextResponse(compressed, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "attachment; filename=compressed.pdf",
    },
  });
}
