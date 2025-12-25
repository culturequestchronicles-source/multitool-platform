import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import formidable from "formidable";
import fs from "fs";
import path from "path";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = formidable();
  const uploadDir = "./public/uploads";
  if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

  const data = await new Promise<any>((resolve, reject) => {
    form.parse(req as any, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const pdfFile = data.files.file[0];
  const bytes = fs.readFileSync(pdfFile.filepath);
  const originalPdf = await PDFDocument.load(bytes);

  const pages = originalPdf.getPageCount();
  const outputFiles: string[] = [];

  for (let i = 0; i < pages; i++) {
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(originalPdf, [i]);
    newPdf.addPage(copiedPage);

    const pdfBytes = await newPdf.save();
    const outputPath = `${uploadDir}/split-page-${i + 1}.pdf`;

    fs.writeFileSync(outputPath, pdfBytes);
    outputFiles.push(outputPath);
  }

  return NextResponse.json({
    success: true,
    pages,
    files: outputFiles,
  });
}
