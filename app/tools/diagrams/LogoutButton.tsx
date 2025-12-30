"use client";

import { useState } from "react";

export default function LogoutButton() {
  const [busy, setBusy] = useState(false);

  const onLogout = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.redirected) {
        window.location.href = res.url;
        return;
      }
      window.location.href = "/login";
    } finally {
      setBusy(false);
    }
  };

  return (
    <button
      className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:opacity-60"
      onClick={onLogout}
      disabled={busy}
    >
      {busy ? "Logging out..." : "Logout"}
    </button>
  );
}
