import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

function toBase64(u8: Uint8Array) {
  let s = "";
  u8.forEach((b) => (s += String.fromCharCode(b)));
  return Buffer.from(s, "binary").toString("base64");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File;

    if (!file) return NextResponse.json({ error: "Please select a PDF." }, { status: 400 });
    if (file.type !== "application/pdf")
      return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
    if (file.size > 20_000_000)
      return NextResponse.json({ error: "Max file size is 20MB." }, { status: 400 });

    const src = await PDFDocument.load(await file.arrayBuffer());
    const count = src.getPageCount();

    // safety cap for beginners
    if (count > 50) {
      return NextResponse.json({ error: "PDF too large (max 50 pages for split)." }, { status: 400 });
    }

    const pages: { name: string; b64: string }[] = [];

    for (let i = 0; i < count; i++) {
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [i]);
      doc.addPage(page);
      const bytes = await doc.save();
      pages.push({ name: `page-${i + 1}.pdf`, b64: toBase64(bytes) });
    }

    return NextResponse.json({ pages });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Split failed" }, { status: 500 });
  }
}
