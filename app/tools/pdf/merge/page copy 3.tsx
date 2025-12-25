"use client";

import { useState } from "react";
import Spinner from "@/components/ui/Spinner";
import ProgressBar from "@/components/ui/ProgressBar";
import FilePreview from "@/components/ui/FilePreview";

export default function PdfMerge() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleConvert = async () => {
    setLoading(true);
    setProgress(0);

    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval);
          setLoading(false);
        }
        return p + 10;
      });
    }, 300);
  };

  return (
    <main style={{ padding: 40, maxWidth: 800, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28 }}>Merge PDF</h1>
      <p style={{ color: "#555", marginBottom: 20 }}>
        Combine multiple PDFs into one file
      </p>

      <input
        type="file"
        accept="application/pdf"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
      />

      <FilePreview file={file} />

      <button
        onClick={handleConvert}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          background: "#2563eb",
          color: "#fff",
          borderRadius: 8,
        }}
      >
        Merge
      </button>

      {loading && (
        <>
          <ProgressBar progress={progress} />
          <div style={{ marginTop: 12 }}>
            <Spinner />
          </div>
        </>
      )}
    </main>
  );
}
