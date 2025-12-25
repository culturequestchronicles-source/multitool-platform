type TrackPayload = {
    tool: string;
    action: string;
    meta?: Record<string, any>;
  };
  
  export async function trackUsage(payload: TrackPayload) {
    try {
      // Don’t break the app if tracking fails
      await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      // silent fail
    }
  }
  