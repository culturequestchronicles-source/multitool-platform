import { NextResponse } from "next/server";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const runtime = "nodejs"; // ensure Node runtime

const MAX_BYTES = 15_000_000; // 15MB

function badRequest(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) return badRequest("Please upload a PDF file");
    if (file.type !== "application/pdf") return badRequest("Invalid file type. Please upload a PDF.");
    if (file.size > MAX_BYTES) return badRequest("File too large. Max 15MB.");

    const buffer = Buffer.from(await file.arrayBuffer());

    // ✅ Robust import for pdf-parse in Next.js (ESM/CJS safe)
    // This avoids "default is not a function" issues.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const pdfParse = require("pdf-parse");
    const parsed = await pdfParse(buffer);

    const text = (parsed?.text || "").trim();
    if (!text) return badRequest("No extractable text found in this PDF (may be scanned).");

    // Build DOCX with simple paragraphs
    const paragraphs = text
      .split(/\n{2,}/g) // split by blank lines into paragraph blocks
      .map((block: string) =>
        new Paragraph({
          children: [new TextRun(block.replace(/\n/g, " ").trim())],
        })
      );

    const doc = new Document({
      sections: [{ children: paragraphs.length ? paragraphs : [new Paragraph(" ")] }],
    });

    const docxBuffer = await Packer.toBuffer(doc);

    return new NextResponse(docxBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="converted.docx"',
      },
    });
  } catch (err: any) {
    console.error("pdf-to-word error:", err);
    return NextResponse.json(
      { error: "PDF → Word conversion failed" },
      { status: 500 }
    );
  }
}
