"use client";

import React from "react";
import { logoutAction } from "@/app/logout/actions";

export default function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: "10px 12px",
          background: "white",
          fontWeight: 900,
          cursor: "pointer",
        }}
      >
        Logout
      </button>
    </form>
  );
}
