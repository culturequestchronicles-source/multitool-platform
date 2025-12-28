import { NextResponse } from "next/server";
import * as XLSX from "xlsx";

export const runtime = "nodejs"; // important on some hosts

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    // Basic validation
    const name = file.name?.toLowerCase() || "";
    const isCsv =
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel" ||
      name.endsWith(".csv");

    if (!isCsv) {
      return NextResponse.json({ error: "Please upload a CSV file" }, { status: 400 });
    }

    const csvText = await file.text();

    // Parse CSV -> rows using SheetJS by reading as CSV
    // This is the most compatible method across ESM/CJS builds.
    const wbFromCsv = XLSX.read(csvText, { type: "string" });
    const firstSheetName = wbFromCsv.SheetNames[0];
    const ws = wbFromCsv.Sheets[firstSheetName];

    if (!ws) {
      return NextResponse.json({ error: "Could not parse CSV" }, { status: 400 });
    }

    // Create a clean workbook and append the parsed sheet
    const outWb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(outWb, ws, "Sheet1");

    // Generate XLSX as ArrayBuffer
    const out = XLSX.write(outWb, { type: "array", bookType: "xlsx" });

    return new NextResponse(out, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="converted.xlsx"`,
      },
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Conversion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
