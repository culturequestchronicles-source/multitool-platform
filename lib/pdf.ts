import { PDFDocument } from "pdf-lib";

export async function loadPdf(file: File) {
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes);
}

export function validatePdf(file: File) {
  if (!file) throw new Error("No file provided");
  if (file.size > 10_000_000) throw new Error("Max file size is 10MB");
  if (file.type !== "application/pdf") throw new Error("Invalid PDF file");
}
