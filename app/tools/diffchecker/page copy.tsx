"use client";

import { useState } from "react";

type DiffLine = {
  left?: string;
  right?: string;
  type: "same" | "added" | "removed" | "changed";
};

function computeDiff(left: string, right: string): DiffLine[] {
  const leftLines = left.split("\n");
  const rightLines = right.split("\n");

  const max = Math.max(leftLines.length, rightLines.length);
  const diff: DiffLine[] = [];

  for (let i = 0; i < max; i++) {
    const l = leftLines[i];
    const r = rightLines[i];

    if (l === r) {
      diff.push({ left: l, right: r, type: "same" });
    } else if (l === undefined) {
      diff.push({ right: r, type: "added" });
    } else if (r === undefined) {
      diff.push({ left: l, type: "removed" });
    } else {
      diff.push({ left: l, right: r, type: "changed" });
    }
  }

  return diff;
}

export default function DiffCheckerPage() {
  const [leftText, setLeftText] = useState("");
  const [rightText, setRightText] = useState("");
  const [diff, setDiff] = useState<DiffLine[]>([]);

  const runDiff = () => {
    setDiff(computeDiff(leftText, rightText));
  };

  const loadFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    side: "left" | "right"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (side === "left") setLeftText(reader.result as string);
      else setRightText(reader.result as string);
    };
    reader.readAsText(file);
  };

  return (
    <main className="p-10">
      <h1 className="text-3xl font-bold mb-6">Diff Checker</h1>

      <div className="grid grid-cols-2 gap-6 mb-4">
        <div>
          <label className="font-semibold">Original Text</label>
          <input
            type="file"
            className="block my-2"
            onChange={(e) => loadFile(e, "left")}
          />
          <textarea
            className="w-full h-64 border rounded p-2"
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
          />
        </div>

        <div>
          <label className="font-semibold">Changed Text</label>
          <input
            type="file"
            className="block my-2"
            onChange={(e) => loadFile(e, "right")}
          />
          <textarea
            className="w-full h-64 border rounded p-2"
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
          />
        </div>
      </div>

      <button
        onClick={runDiff}
        className="bg-green-600 text-white px-6 py-2 rounded mb-6"
      >
        Find difference
      </button>

      {diff.length > 0 && (
        <div className="border rounded overflow-hidden">
          {diff.map((line, i) => (
            <div
              key={i}
              className={`grid grid-cols-2 px-2 py-1 text-sm font-mono
                ${
                  line.type === "added"
                    ? "bg-green-100"
                    : line.type === "removed"
                    ? "bg-red-100"
                    : line.type === "changed"
                    ? "bg-yellow-100"
                    : ""
                }`}
            >
              <div>{line.left ?? ""}</div>
              <div>{line.right ?? ""}</div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
