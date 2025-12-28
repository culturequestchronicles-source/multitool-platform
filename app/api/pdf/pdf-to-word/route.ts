import { NextResponse } from "next/server";

import { Document, Packer, Paragraph, TextRun } from "docx";



export const runtime = "nodejs";



function ensurePdfJsPolyfills() {
  if (typeof (globalThis as any).DOMMatrix === "undefined") {
    class DOMMatrixPolyfill {
      multiply() {
        return this;
      }

      multiplySelf() {
        return this;
      }

      invertSelf() {
        return this;
      }
    }

    (globalThis as any).DOMMatrix = DOMMatrixPolyfill;
  }

  if (typeof (globalThis as any).Path2D === "undefined") {
    (globalThis as any).Path2D = class {};
  }

  if (typeof (globalThis as any).ImageData === "undefined") {
    (globalThis as any).ImageData = class {
      data: Uint8ClampedArray;
      height: number;
      width: number;

      constructor(width = 0, height = 0) {
        this.width = width;
        this.height = height;
        this.data = new Uint8ClampedArray(width * height * 4);
      }
    };
  }
}

ensurePdfJsPolyfills();



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
    const pdfParseModule = await import("pdf-parse");
    const pdfParse =
      (pdfParseModule as { default?: typeof pdfParseModule }).default ?? pdfParseModule;

    const form = await req.formData();

    const file = form.get("file") as File | null;



    if (!file) return NextResponse.json({ error: "No PDF uploaded" }, { status: 400 });

    if (file.type !== "application/pdf") {

      return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 });

    }



    const buffer = Buffer.from(await file.arrayBuffer());

    const parsed = await (pdfParse as any)(buffer);

    const text = String(parsed?.text || "").trim();



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

    // Using 'as any' here breaks the strict link to SharedArrayBuffer that triggers the build error.

    const body = new Uint8Array(out as any);



    // 3. Return a standard Response using the bytes directly (skipping Blob)

    return new Response(body, {

      status: 200,

      headers: noStoreHeaders({

        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

        "Content-Disposition": 'attachment; filename="converted.docx"',

      }),

    });

  } catch (e: any) {

    console.error("PDF-to-Word Error:", e);

    return NextResponse.json({ error: e?.message || "PDF to Word failed" }, { status: 500 });

  }

}
