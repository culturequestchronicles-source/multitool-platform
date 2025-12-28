import { NextResponse } from "next/server";
import * as pdfParse from "pdf-parse";
import { Document, Packer, Paragraph, TextRun } from "docx";

export const runtime = "nodejs";

type PdfParseResult = {
  text?: string;
};

function noStoreHeaders(extra: Record<string, string>) {
  return {
    ...extra,
    "Cache-Control": "no-store, no-cache, must-revalidate",
    Pragma: "no-cache",
    Expires: "0",
  };
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });
    if (file.type !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsePdf = pdfParse as unknown as (data: Buffer) => Promise<PdfParseResult>;
    const parsed = await parsePdf(buffer);
    const text = String(parsed.text || "").trim();

    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              children: [new TextRun(text || "No extractable text found in PDF.")],
            }),
          ],
        },
      ],
    });

    // 1. Generate the docx buffer
    const out = await Packer.toBuffer(doc);

    // 2. THE FIX: Convert to Uint8Array directly.
    const body = new Uint8Array(out);

    // 3. Return a standard Response using the bytes directly (skipping Blob)
    return new Response(body, {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": 'attachment; filename="converted.docx"',
      }),
    });
  } catch (err: unknown) {
    console.error("PDF-to-Word Error:", err);
    const message =
      err instanceof Error ? err.message : "PDF to Word failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
