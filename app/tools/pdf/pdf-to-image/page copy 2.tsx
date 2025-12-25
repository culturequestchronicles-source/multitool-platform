"use client";

import { useState, useRef } from "react";

export default function PdfSplitPage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);

  function onFileSelect(f: File) {
    if (f.type !== "application/pdf") {
      alert("Please select a PDF file");
      return;
    }
    setFile(f);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.[0]) {
      onFileSelect(e.target.files[0]);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);

    if (e.dataTransfer.files?.[0]) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-4">PDF-to-Image</h1>
      <p className="text-gray-600 mb-6">
        Upload  PDF to convert to Image.
      </p>

      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition
          ${dragging ? "border-blue-500 bg-blue-50" : "border-gray-300"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          hidden
          onChange={handleChange}
        />

        <p className="text-lg font-semibold">
          Click or drag PDF here
        </p>
        <p className="text-sm text-gray-500">
          Only PDF files supported
        </p>
      </div>

      {/* File Preview */}
      {file && (
        <div className="mt-6 border rounded-lg p-4 flex justify-between items-center">
          <div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-gray-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            PDF2Image
          </button>
        </div>
      )}
    </main>
  );
}
