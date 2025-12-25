type Job = {
    jobId: string;
    status: "queued" | "running" | "done" | "error";
    progress: number; // 0..100
    message?: string;
    // For previews (base64 thumbnails)
    previews?: { page: number; dataUrl: string }[];
    // Final zip download as base64
    zipBase64?: string;
  };
  
  const jobs = new Map<string, Job>();
  
  export function createJob(): Job {
    const jobId = crypto.randomUUID();
    const job: Job = { jobId, status: "queued", progress: 0, previews: [] };
    jobs.set(jobId, job);
    return job;
  }
  
  export function updateJob(jobId: string, patch: Partial<Job>) {
    const existing = jobs.get(jobId);
    if (!existing) return;
    jobs.set(jobId, { ...existing, ...patch });
  }
  
  export function getJob(jobId: string) {
    return jobs.get(jobId);
  }
  