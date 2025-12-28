export type JobStatus = "queued" | "running" | "done" | "error";

export type JobPreview = {
  page: number;
  dataUrl: string;
};

export type Job = {
  jobId: string;
  status: JobStatus;
  progress: number; // 0..100
  message?: string;
  // For previews (base64 thumbnails)
  previews?: JobPreview[];
  // Final zip download as base64
  zipBase64?: string;
  createdAt: string;
  updatedAt: string;
};

const jobs = new Map<string, Job>();

const clampProgress = (value: number) => Math.min(100, Math.max(0, value));

export function createJob(): Job {
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();
  const job: Job = {
    jobId,
    status: "queued",
    progress: 0,
    previews: [],
    createdAt: now,
    updatedAt: now,
  };
  jobs.set(jobId, job);
  return job;
}

export function updateJob(jobId: string, patch: Partial<Job>) {
  const existing = jobs.get(jobId);
  if (!existing) return;
  const next: Job = {
    ...existing,
    ...patch,
    progress:
      typeof patch.progress === "number"
        ? clampProgress(patch.progress)
        : existing.progress,
    updatedAt: new Date().toISOString(),
  };
  jobs.set(jobId, next);
  return next;
}

export function getJob(jobId: string) {
  return jobs.get(jobId);
}
  
