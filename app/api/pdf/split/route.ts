import { PDFDocument } from "pdf-lib";
import JSZip from "jszip";
import { noStoreHeaders } from "@/lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) return Response.json({ error: "No PDF uploaded" }, { status: 400 });

    const src = await PDFDocument.load(await file.arrayBuffer());
    const pageCount = src.getPageCount();
    const zip = new JSZip();

    for (let i = 0; i < pageCount; i++) {
      const doc = await PDFDocument.create();
      const [page] = await doc.copyPages(src, [i]);
      doc.addPage(page);
      const bytes = await doc.save();
      zip.file(`page-${String(i + 1).padStart(3, "0")}.pdf`, bytes);
    }

    const zipArrayBuffer = await zip.generateAsync({ type: "arraybuffer" });

    // Fix: Cast to Uint8Array
    return new Response(new Uint8Array(zipArrayBuffer), {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": "application/zip",
        "Content-Disposition": 'attachment; filename="split-pages.zip"',
      }),
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Split failed" }, { status: 500 });
  }
}