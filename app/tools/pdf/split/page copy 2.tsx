"use client";

export default function ToolPage() {
  return (
    <main style={{ padding: "60px 40px", maxWidth: 900, margin: "auto" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Split PDF</h1>
      <p style={{ color: "#555", marginBottom: 32 }}>
        Split PDF into multiple files 
      </p>

      <div
        style={{
          border: "2px dashed #c7d2fe",
          borderRadius: 12,
          padding: 40,
          textAlign: "center",
          background: "#f8fafc",
        }}
      >
        <p style={{ fontSize: 16, marginBottom: 12 }}>
          Drag & drop PDF files here
        </p>
        <button
          style={{
            padding: "12px 20px",
            background: "#2563eb",
            color: "#fff",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
          }}
        >
          Select Files
        </button>
      </div>
    </main>
  );
}
