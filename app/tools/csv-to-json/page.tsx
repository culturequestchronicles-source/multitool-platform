"use client";

import { useState } from "react";
import Papa from "papaparse";
import { CloudArrowUpIcon } from "@heroicons/react/24/outline";

type OutputType = "array" | "hash" | "minify";

export default function CsvConverterPage() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [csvText, setCsvText] = useState<string>("");
  const [jsonOutput, setJsonOutput] = useState<any[]>([]);
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
      const keys = Object.keys(data[0] || {});
      const transposed: any[] = keys.map((k) =>
        data.map((row) => row[k])
      );
      data = transposed as any;
    }

    if (outputType === "hash") {
      const hash: Record<string, any> = {};
      data.forEach((row, i) => {
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
    const blob = new Blob(
      [typeof jsonOutput === "string" ? jsonOutput : JSON.stringify(jsonOutput, null, 2)],
      { type: "application/json" }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "output.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-6">
        <CloudArrowUpIcon className="h-8 w-8 text-blue-600" />
        CSV → JSON / AI Converter
      </h1>

      {/* File Upload */}
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
            className="border rounded p-2 w-full"
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          ></textarea>
        </div>
      </div>

      {/* Options */}
      <div className="flex flex-wrap gap-4 items-center mb-4">
        <div>
          <label>Separator</label>
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

        <label className="flex items-center gap-1">
          <input type="checkbox" checked={parseNumbers} onChange={() => setParseNumbers(!parseNumbers)} />
          Parse numbers
        </label>

        <label className="flex items-center gap-1">
          <input type="checkbox" checked={parseJson} onChange={() => setParseJson(!parseJson)} />
          Parse JSON
        </label>

        <label className="flex items-center gap-1">
          <input type="checkbox" checked={transpose} onChange={() => setTranspose(!transpose)} />
          Transpose
        </label>

        <div>
          <label>Output:</label>
          <select
            value={outputType}
            onChange={(e) => setOutputType(e.target.value as OutputType)}
            className="border p-1 rounded ml-2"
          >
            <option value="array">Array</option>
            <option value="hash">Hash</option>
            <option value="minify">Minify</option>
          </select>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2 mb-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={handleConvert}
        >
          Convert
        </button>
        <button
          className="bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
          onClick={handleClear}
        >
          Clear
        </button>
        {jsonOutput.length > 0 && (
          <>
            <button
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              onClick={handleDownload}
            >
              Download
            </button>
            <button
              className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              onClick={() =>
                navigator.clipboard.writeText(
                  typeof jsonOutput === "string" ? jsonOutput : JSON.stringify(jsonOutput, null, 2)
                )
              }
            >
              Copy to clipboard
            </button>
          </>
        )}
      </div>

      {/* JSON Output */}
      {jsonOutput.length > 0 && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96 mb-4">
          {typeof jsonOutput === "string" ? jsonOutput : JSON.stringify(jsonOutput, null, 2)}
        </pre>
      )}

      {/* AI Agent */}
      <div className="border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">AI Agent: Convert / Analyze Data</h2>
        <textarea
          rows={3}
          className="border p-2 rounded w-full mb-2"
          placeholder="Ask AI to convert or analyze your CSV/JSON/Excel data"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
          onClick={handleAiConversion}
        >
          Run AI Agent
        </button>

        {aiResponse && (
          <pre className="bg-gray-200 p-4 rounded mt-4 whitespace-pre-wrap">{aiResponse}</pre>
        )}
      </div>
    </div>
  );
}
