"use client";

import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error" | "finishing">("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  // If Supabase redirects here with #access_token..., finalize by sending tokens to server.
  useEffect(() => {
    const run = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      const params = new URLSearchParams(hash.replace("#", ""));
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");
      const err = params.get("error");
      const errDesc = params.get("error_description");

      if (err) {
        setStatus("error");
        setErrorMsg(decodeURIComponent((errDesc || err).replace(/\+/g, " ")));
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (!access_token || !refresh_token) return;

      try {
        setStatus("finishing");
        setErrorMsg("");

        const res = await fetch("/api/auth/accept-token", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ access_token, refresh_token }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data?.error ?? "Failed to finish login");

        // Clean URL and go to diagrams
        window.history.replaceState({}, document.title, window.location.pathname);
        window.location.href = "/tools/diagrams";
      } catch (e: any) {
        setStatus("error");
        setErrorMsg(e?.message ?? "Could not finish login");
      }
    };

    run();
  }, []);

  const sendMagicLink = async () => {
    try {
      setStatus("sending");
      setErrorMsg("");

      const res = await fetch("/api/auth/send-magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.error ?? "Failed to send link");

      setStatus("sent");
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e?.message ?? "Unknown error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-gray-600">
          Enter your email and we’ll send a magic link.
        </p>

        {status === "finishing" && (
          <div className="mt-4 rounded-xl border bg-gray-50 p-3 text-sm">
            Finishing sign-in...
          </div>
        )}

        {status === "error" && errorMsg && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMsg}
          </div>
        )}

        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border px-3 py-2"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            className="w-full rounded-xl bg-black text-white px-3 py-2 disabled:opacity-50"
            onClick={sendMagicLink}
            disabled={!email || status === "sending" || status === "finishing"}
          >
            {status === "sending" ? "Sending..." : "Send magic link"}
          </button>

          {status === "sent" && (
            <div className="text-sm text-green-700 rounded-xl border border-green-200 bg-green-50 p-3">
              Link sent! Check your inbox.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
