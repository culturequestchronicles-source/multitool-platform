type TrackPayload = {
  tool: string;
  action: string;
  meta?: Record<string, unknown>;
};

const TRACK_ENDPOINT = "/api/track";
const TRACK_TIMEOUT_MS = 3000;

export async function trackUsage(payload: TrackPayload) {
  try {
    const body = JSON.stringify(payload);

    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      navigator.sendBeacon(TRACK_ENDPOINT, blob);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), TRACK_TIMEOUT_MS);

    await fetch(TRACK_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
      signal: controller.signal,
    });

    window.clearTimeout(timeout);
  } catch {
    // silent fail
  }
}
  
