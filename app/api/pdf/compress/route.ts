import { NextRequest, NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";

export async function POST(req: NextRequest) {
  try {
    // 1. Get the uploaded file from the request
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // 2. Convert the file into a format the PDF library can read
    const arrayBuffer = await file.arrayBuffer();

    // 3. Load the PDF into memory
    // 'ignoreEncryption' allows us to process files even if they have some restrictions
    const pdfDoc = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });

    // 4. Optimization: Strip Metadata
    // Metadata (author, producer, etc.) takes up space. We clear it to save bytes.
    pdfDoc.setTitle("");
    pdfDoc.setAuthor("");
    pdfDoc.setProducer("");
    pdfDoc.setCreator("");

    // 5. Save the PDF with compression
    // 'useObjectStreams' is the most important part for reducing file size
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
    });

    // 6. Return the file
    // We wrap 'compressedBytes' in new Uint8Array() to fix the Vercel Type Error
    return new Response(new Uint8Array(compressedBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="compressed-${file.name}"`,
      },
    });

  } catch (error) {
    console.error("PDF Compression Error:", error);
    return NextResponse.json(
      { error: "Failed to process PDF. Make sure it's not password protected." },
      { status: 500 }
    );
  }
}