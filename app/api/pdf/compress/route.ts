import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) return NextResponse.json({ error: "Please select a PDF." }, { status: 400 });
    if (file.type !== "application/pdf")
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    if (file.size > 20_000_000)
      return NextResponse.json({ error: "Max file size is 20MB." }, { status: 400 });

    const pdf = await PDFDocument.load(await file.arrayBuffer());

    // pdf-lib doesn't do true image recompression; this saves in a streamlined way.
    const out = await pdf.save({ useObjectStreams: false });

    return new NextResponse(out, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="compressed.pdf"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Compress failed" }, { status: 500 });
  }
}
