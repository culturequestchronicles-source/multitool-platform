"use client";

import { useState } from "react";
import Papa from "papaparse";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

type OutputType = "array" | "hash" | "minify";

export default function CsvConverterPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  // Fix 1: Changed type to 'any' to allow both Array and String (for minify)
  const [jsonOutput, setJsonOutput] = useState<any>([]);
  const [separator, setSeparator] = useState<string>("");
  const [parseNumbers, setParseNumbers] = useState(true);
  const [parseJson, setParseJson] = useState(true);
  const [transpose, setTranspose] = useState(false);
  const [outputType, setOutputType] = useState<OutputType>("array");
  const [prompt, setPrompt] = useState<string>("");
  const [aiResponse, setAiResponse] = useState<string>("");

  function handleFile(file: File) {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      setCsvText(e.target?.result as string);
    };
    reader.readAsText(file);
  }

  function handleConvert() {
    if (!csvText) return;
    const results = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: parseNumbers,
      delimiter: separator || undefined,
    });

    let data = results.data;

    if (transpose) {
      // Fix 2: Cast row to 'any' so TypeScript allows row[k] access
      const keys = Object.keys(data[0] || {});
      const transposed: any[] = keys.map((k) =>
        data.map((row: any) => row[k])
      );
      data = transposed;
    }

    if (outputType === "hash") {
      const hash: Record<string, any> = {};
      data.forEach((row: any, i) => {
        hash[i] = row;
      });
      setJsonOutput([hash]);
    } else if (outputType === "minify") {
      setJsonOutput(JSON.stringify(data));
    } else {
      setJsonOutput(data);
    }
  }

  function handleClear() {
    setCsvText("");
    setJsonOutput([]);
    setFileName(null);
    setAiResponse("");
  }

  async function handleAiConversion() {
    if (!prompt) return;
    try {
      const res = await fetch("/api/openai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      setAiResponse(data.text || "AI returned no response");
    } catch (err: any) {
      setAiResponse("Error: " + err.message);
    }
  }

  function handleDownload() {
    const content = typeof jsonOutput === "string" ? jsonOutput : JSON.stringify(jsonOutput, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  // Helper to determine if we should show action buttons
  const hasOutput = Array.isArray(jsonOutput) ? jsonOutput.length > 0 : !!jsonOutput;

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
        CSV → JSON / AI Converter
      </h1>

      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <div className="flex-1">
          <label className="block font-semibold mb-1">Upload a CSV file</label>
          <input
            type="file"
            accept=".csv"
            onChange={(e) => e.target.files && handleFile(e.target.files[0])}
            className="border rounded p-2 w-full"
          />
          {fileName && <p className="text-gray-700 mt-1">Selected file: {fileName}</p>}
        </div>
        <div className="flex-1">
          <label className="block font-semibold mb-1">Or paste your CSV here</label>
          <textarea
            rows={10}
            className="border rounded p-2 w-full text-sm font-mono"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          ></textarea>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 items-center mb-4 bg-white p-4 rounded-lg border">
        <div>
          <label className="text-sm font-medium">Separator</label>
          <select
            value={separator}
            onChange={(e) => setSeparator(e.target.value)}
            className="border p-1 rounded ml-2"
          >
            <option value="">Auto-detect</option>
            <option value=",">Comma (,)</option>
            <option value=";">Semicolon (;)</option>
            <option value="\t">Tab (\t)</option>
          </select>
        </div>

        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input type="checkbox" checked={parseNumbers} onChange={() => setParseNumbers(!parseNumbers)} />
          Parse numbers
        </label>

        <label className="flex items-center gap-1 text-sm cursor-pointer">
          <input type="checkbox" checked={transpose} onChange={() => setTranspose(!transpose)} />
          Transpose
        </label>

        <div>
          <label className="text-sm font-medium">Output format:</label>
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as OutputType)}
            className="border p-1 rounded ml-2"
          >
            <option value="array">JSON Array</option>
            <option value="hash">JSON Hash</option>
            <option value="minify">Minified String</option>
          </select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition" onClick={handleConvert}>
          Convert
        </button>
        <button className="bg-gray-200 px-6 py-2 rounded-lg font-semibold hover:bg-gray-300 transition" onClick={handleClear}>
          Clear
        </button>
        {hasOutput && (
          <>
            <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-700 transition" onClick={handleDownload}>
              Download
            </button>
            <button 
              className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-yellow-600 transition"
              onClick={() => navigator.clipboard.writeText(typeof jsonOutput === "string" ? jsonOutput : JSON.stringify(jsonOutput, null, 2))}
            >
              Copy
            </button>
          </>
        )}
      </div>

      {hasOutput && (
        <pre className="bg-gray-900 text-blue-400 p-4 rounded-lg overflow-auto max-h-96 mb-4 text-xs">
          {typeof jsonOutput === "string" ? jsonOutput : JSON.stringify(jsonOutput, null, 2)}
        </pre>
      )}

      <div className="border-t pt-6 mt-8">
        <h2 className="text-xl font-bold mb-2">AI Agent: Analyze CSV</h2>
        <textarea
          rows={3}
          className="border p-3 rounded-lg w-full mb-3"
          placeholder="e.g., 'Summarize the total sales by region' or 'Find the highest value in column B'"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-700 transition" onClick={handleAiConversion}>
          Run AI Agent
        </button>

        {aiResponse && (
          <div className="bg-purple-50 border border-purple-100 p-4 rounded-lg mt-4 text-purple-900 whitespace-pre-wrap">
            {aiResponse}
          </div>
        )}
      </div>
    </div>
  );
}