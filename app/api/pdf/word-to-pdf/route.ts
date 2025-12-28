import { NextResponse } from "next/server";
import { PDFDocument, PDFFont, StandardFonts, rgb } from "pdf-lib";
import mammoth from "mammoth";
import { noStoreHeaders } from "../../../../lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No DOCX uploaded" }, { status: 400 });
    }

    const okTypes = [
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/octet-stream",
    ];
    const nameOk = (file.name || "").toLowerCase().endsWith(".docx");
    
    if (!okTypes.includes(file.type) && !nameOk) {
      return NextResponse.json({ error: "Only .docx files are allowed" }, { status: 400 });
    }

    // 1. Extract text from DOCX using Mammoth
    const docxBuffer = Buffer.from(await file.arrayBuffer());
    const extracted = await mammoth.extractRawText({ buffer: docxBuffer });
    const text = (extracted.value || "").trim() || "No text extracted.";

    // 2. Create PDF Document
    const pdf = await PDFDocument.create();
    const font = await pdf.embedFont(StandardFonts.Helvetica);

    const fontSize = 12;
    const margin = 50;
    const pageSize: [number, number] = [595.28, 841.89]; // A4 Size
    const maxWidth = pageSize[0] - margin * 2;
    const lineHeight = fontSize + 4;

    let page = pdf.addPage(pageSize);
    const lines = wrapText(text, font, fontSize, maxWidth);

    let y = pageSize[1] - margin;

    // 3. Draw text and handle page breaks
    for (const line of lines) {
      // Check if we need a new page
      if (y < margin + lineHeight) {
        page = pdf.addPage(pageSize);
        y = pageSize[1] - margin;
      }
      
      page.drawText(line, {
        x: margin,
        y,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });
      
      y -= lineHeight;
    }

    // 4. Save and return using Build-Safe types
    const out = await pdf.save();
    const body = new Uint8Array(out); // Fix: Explicitly wrap for TypeScript/Vercel

    return new Response(body, {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
      }),
    });
    
  } catch (err: unknown) {
    console.error("Word-to-PDF error:", err);
    const message =
      err instanceof Error ? err.message : "Word to PDF failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// Helper function to wrap text within margins
function wrapText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const words = text.replace(/\r/g, "").split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const w of words) {
    const testLine = currentLine ? `${currentLine} ${w}` : w;
    const width = font.widthOfTextAtSize(testLine, size);
    
    if (width <= maxWidth) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = w;
    }
  }
  
  if (currentLine) lines.push(currentLine);
  return lines;
}
