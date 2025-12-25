import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files || files.length < 2) {
      return NextResponse.json(
        { error: "Please select at least 2 PDF files." },
        { status: 400 }
      );
    }

    const merged = await PDFDocument.create();

    for (const f of files) {
      if (f.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are allowed." }, { status: 400 });
      }
      if (f.size > 20_000_000) {
        return NextResponse.json({ error: "Max file size is 20MB per PDF." }, { status: 400 });
      }

      const srcBytes = await f.arrayBuffer();
      const srcPdf = await PDFDocument.load(srcBytes);
      const pages = await merged.copyPages(srcPdf, srcPdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }

    const out = await merged.save();

    return new NextResponse(out, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Merge failed" }, { status: 500 });
  }
}
