import { PDFDocument } from "pdf-lib";

const MAX_PDF_SIZE_BYTES = 10_000_000;
const ACCEPTED_PDF_TYPES = new Set(["application/pdf"]);

export async function loadPdf(file: File) {
  const bytes = await file.arrayBuffer();
  return PDFDocument.load(bytes);
}

export function validatePdf(file: File) {
  if (!file) throw new Error("No file provided");
  if (file.size === 0) throw new Error("PDF file is empty");
  if (file.size > MAX_PDF_SIZE_BYTES) throw new Error("Max file size is 10MB");
  if (!ACCEPTED_PDF_TYPES.has(file.type)) {
    throw new Error("Invalid PDF file");
  }
}
