"use client";

import { useState, useRef } from "react";
import { FileText, Download, Upload, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

export default function PdfToWordPage() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "processing" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (selectedFile: File | undefined) => {
    if (!selectedFile) return;
    if (selectedFile.type !== "application/pdf") {
      setStatus("error");
      setMessage("Please upload a valid PDF file.");
      return;
    }
    setFile(selectedFile);
    setStatus("idle");
    setMessage("");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileChange(e.dataTransfer.files[0]);
  };

  const handleSubmit = async () => {
    if (!file) return;

    setStatus("processing");
    setMessage("Analyzing PDF layers and converting to DOCX...");

    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/pdf/pdf-to-word", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Conversion failed. Please try a smaller file.");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(".pdf", "")}_Jhatpat.docx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      setStatus("success");
      setMessage("Your file has been converted successfully!");
    } catch (err: any) {
      setStatus("error");
      setMessage(err.message || "An unexpected error occurred.");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setMessage("");
  };

  return (
    <main className="min-h-screen bg-[#fcfcfd] py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3">
            PDF to Word <span className="text-blue-600">Converter</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-lg mx-auto">
            Accurately convert PDF documents to editable Microsoft Word files while preserving layouts.
          </p>
        </div>

        {/* Tool Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden">
          <div className="p-8">
            {status === "idle" && !file ? (
              <div 
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragging ? "border-blue-500 bg-blue-50" : "border-slate-200 hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  hidden 
                  accept=".pdf" 
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
                <Upload className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-lg font-semibold text-slate-700">Click or drag PDF here</p>
                <p className="text-sm text-slate-400 mt-1">Maximum file size: 25MB</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* File Preview Card */}
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileText className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[200px] md:max-w-xs">{file?.name}</p>
                      <p className="text-xs text-slate-500">{(file?.size || 0) / 1024 / 1024 < 1 ? "Under 1MB" : `${((file?.size || 0) / 1024 / 1024).toFixed(2)} MB`}</p>
                    </div>
                  </div>
                  {status !== "processing" && (
                    <button onClick={reset} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
                      <X className="w-5 h-5 text-slate-500" />
                    </button>
                  )}
                </div>

                {/* Progress/Status Info */}
                {status === "processing" && (
                  <div className="flex items-center justify-center gap-3 p-6 animate-pulse">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <p className="text-blue-600 font-medium">{message}</p>
                  </div>
                )}

                {status === "success" && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-xl border border-green-100">
                    <CheckCircle2 className="w-5 h-5" />
                    <p className="font-medium">{message}</p>
                  </div>
                )}

                {status === "error" && (
                  <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-xl border border-red-100">
                    <AlertCircle className="w-5 h-5" />
                    <p className="font-medium">{message}</p>
                  </div>
                )}

                {/* Action Button */}
                {status !== "success" && (
                  <button
                    onClick={handleSubmit}
                    disabled={status === "processing" || !file}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {status === "processing" ? "Converting..." : "Convert to Word"}
                    <Download className="w-5 h-5" />
                  </button>
                )}

                {status === "success" && (
                  <button
                    onClick={reset}
                    className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all"
                  >
                    Convert Another File
                  </button>
                )}
              </div>
            )}
          </div>
          
          {/* Trust Footer */}
          <div className="bg-slate-50 px-8 py-4 border-t border-slate-100 flex items-center justify-center gap-6 opacity-60">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span> 100% Private
            </div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span> Cloud Processing
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}