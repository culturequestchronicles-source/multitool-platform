import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const job = getJob(jobId);
  if (!job || job.status !== "done" || !job.zipBase64) {
    return NextResponse.json({ error: "Not ready" }, { status: 400 });
  }

  const zipBuffer = Buffer.from(job.zipBase64, "base64");

  return new NextResponse(zipBuffer, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=pdf-pages-${jobId}.zip`,
    },
  });
}
