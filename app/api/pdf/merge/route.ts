import { PDFDocument } from "pdf-lib";
import { noStoreHeaders } from "@/lib/http"; // Removed toArrayBuffer from here

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files?.length) {
      return Response.json({ error: "No PDF files uploaded" }, { status: 400 });
    }

    const merged = await PDFDocument.create();

    for (const f of files) {
      if (f.type !== "application/pdf") {
        return Response.json({ error: "Only PDF files are allowed" }, { status: 400 });
      }
      const pdf = await PDFDocument.load(await f.arrayBuffer());
      const pages = await merged.copyPages(pdf, pdf.getPageIndices());
      pages.forEach((p) => merged.addPage(p));
    }

    // PDF-Lib returns a Uint8Array
    const out = await merged.save(); 

    // ✅ THE FIX: Wrap it in a new Uint8Array to satisfy Vercel's build worker
    return new Response(new Uint8Array(out), {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="merged.pdf"',
      }),
    });
  } catch (e: any) {
    return Response.json({ error: e?.message || "Merge failed" }, { status: 500 });
  }
}