import { NextResponse } from "next/server";
import mammoth from "mammoth";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const nameOk =
      file.name.toLowerCase().endsWith(".docx") || file.type.includes("wordprocessingml");
    if (!nameOk) {
      return NextResponse.json({ error: "Please upload a DOCX file" }, { status: 400 });
    }
    if (file.size > 20_000_000) {
      return NextResponse.json({ error: "Max file size is 20MB" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    // Extract raw text from docx
    const { value } = await mammoth.extractRawText({ buffer });
    const text = (value || "").trim();

    // Create a PDF with text (simple, reliable)
    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);

    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();

    const fontSize = 12;
    const lineHeight = 16;
    const margin = 50;
    const maxWidth = width - margin * 2;

    const words = (text || "No text found in DOCX.").split(/\s+/);
    let line = "";
    let y = height - margin;

    function drawLine(s: string) {
      page.drawText(s, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      y -= lineHeight;
      if (y < margin) {
        // new page
        const newPage = pdfDoc.addPage();
        y = newPage.getSize().height - margin;
        // swap current page reference (simple approach)
        // NOTE: for simplicity, we keep drawing on new page by reassigning
        // but pdf-lib page is immutable reference, so we need a variable:
        (currentPage as any) = newPage;
      }
    }

    // Use a mutable reference for current page
    let currentPage: any = page;

    function measureWidth(s: string) {
      return font.widthOfTextAtSize(s, fontSize);
    }

    for (const w of words) {
      const test = line ? `${line} ${w}` : w;
      if (measureWidth(test) > maxWidth) {
        currentPage.drawText(line, {
          x: margin,
          y,
          size: fontSize,
          font,
          color: rgb(0, 0, 0),
        });
        y -= lineHeight;
        if (y < margin) {
          currentPage = pdfDoc.addPage();
          const size = currentPage.getSize();
          y = size.height - margin;
        }
        line = w;
      } else {
        line = test;
      }
    }

    if (line) {
      currentPage.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      },
    });
  } catch (err: any) {
    console.error("word-to-pdf error:", err);
    return NextResponse.json({ error: "Conversion failed" }, { status: 500 });
  }
}
