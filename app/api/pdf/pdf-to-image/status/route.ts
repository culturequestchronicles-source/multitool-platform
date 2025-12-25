import { NextResponse } from "next/server";
import { getJob } from "@/lib/jobStore";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const jobId = url.searchParams.get("jobId");

  if (!jobId) {
    return NextResponse.json({ error: "Missing jobId" }, { status: 400 });
  }

  const job = getJob(jobId);
  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 });
  }

  // Don’t send huge zip unless done
  return NextResponse.json({
    jobId: job.jobId,
    status: job.status,
    progress: job.progress,
    message: job.message,
    previews: job.previews || [],
    done: job.status === "done",
    hasZip: Boolean(job.zipBase64),
  });
}
