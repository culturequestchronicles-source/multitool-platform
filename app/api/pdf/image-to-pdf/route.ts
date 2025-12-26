import { NextResponse } from "next/server";
import { PDFDocument } from "pdf-lib";
import { noStoreHeaders } from "../../../../lib/http";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const files = form.getAll("files") as File[];

    if (!files?.length) {
      return NextResponse.json({ error: "No images uploaded" }, { status: 400 });
    }

    const pdf = await PDFDocument.create();

    for (const f of files) {
      const bytes = Buffer.from(await f.arrayBuffer());
      let img;
      if (f.type === "image/png") img = await pdf.embedPng(bytes);
      else img = await pdf.embedJpg(bytes);

      const { width, height } = img.scale(1);
      const page = pdf.addPage([width, height]);
      page.drawImage(img, { x: 0, y: 0, width, height });
    }

    const out = await pdf.save();
    // Use new Response with Uint8Array for build safety
    return new Response(new Uint8Array(out), {
      status: 200,
      headers: noStoreHeaders({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="images.pdf"',
      }),
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Image to PDF failed" }, { status: 500 });
  }
}