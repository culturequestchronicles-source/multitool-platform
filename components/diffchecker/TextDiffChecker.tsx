"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import * as Diff from "diff";
import { useVirtualizer } from "@tanstack/react-virtual";

type ViewMode = "side-by-side" | "unified";

type DiffRow = {
  index: number;
  kind: "equal" | "added" | "removed" | "changed";
  leftLineNo: number | null;
  rightLineNo: number | null;
  leftHtml: string;   // escaped + highlights
  rightHtml: string;  // escaped + highlights
  unifiedHtml: string;
};

type Summary = {
  additions: number;   // lines
  deletions: number;   // lines
  changed: number;     // rows changed
  charAdditions: number;
  charDeletions: number;
};

function escapeHtml(s: string) {
  return (s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function normalizeText(text: string, opts: { ignoreCase: boolean; trimLines: boolean }) {
  let t = text ?? "";
  if (opts.trimLines) {
    t = t
      .split("\n")
      .map((l) => l.trim())
      .join("\n");
  }
  if (opts.ignoreCase) t = t.toLowerCase();
  return t;
}

/**
 * Intra-line diff using jsdiff words-with-space.
 * - deletions: red highlight on left
 * - additions: green highlight on right
 */
function intraLineHtml(oldLine: string, newLine: string) {
  const parts = Diff.diffWordsWithSpace(oldLine ?? "", newLine ?? "");
  let left = "";
  let right = "";
  let charAdds = 0;
  let charDels = 0;

  for (const p of parts) {
    const val = escapeHtml(p.value);
    if (p.added) {
      charAdds += p.value.length;
      right += `<span class="td_intra_add">${val}</span>`;
    } else if (p.removed) {
      charDels += p.value.length;
      left += `<span class="td_intra_del">${val}</span>`;
    } else {
      left += val;
      right += val;
    }
  }

  return { left, right, charAdds, charDels };
}

function countLinesFromDiffValue(v: string) {
  if (!v) return 0;
  const lines = v.split("\n");
  if (lines.length && lines[lines.length - 1] === "") lines.pop();
  return lines.length;
}

function buildDiffRows(args: {
  leftText: string;
  rightText: string;
  ignoreWhitespace: boolean;
  ignoreCase: boolean;
  trimLines: boolean;
}): { rows: DiffRow[]; summary: Summary; changeIndexes: number[] } {
  const { leftText, rightText, ignoreWhitespace, ignoreCase, trimLines } = args;

  // normalized for diffing
  const nl = normalizeText(leftText, { ignoreCase, trimLines });
  const nr = normalizeText(rightText, { ignoreCase, trimLines });

  // original for display
  const leftLines = (leftText ?? "").split("\n");
  const rightLines = (rightText ?? "").split("\n");

  const diffBlocks = Diff.diffLines(nl, nr, {
    ignoreWhitespace,
    newlineIsToken: true,
  });

  let lPtr = 0;
  let rPtr = 0;

  let additions = 0;
  let deletions = 0;
  let changed = 0;
  let charAdditions = 0;
  let charDeletions = 0;

  const rows: DiffRow[] = [];
  const changeIndexes: number[] = [];

  const takeLeft = (n: number) => {
    const out = leftLines.slice(lPtr, lPtr + n);
    lPtr += n;
    return out;
  };

  const takeRight = (n: number) => {
    const out = rightLines.slice(rPtr, rPtr + n);
    rPtr += n;
    return out;
  };

  let pendingRemoved: string[] | null = null;
  let pendingRemovedStartLineNo: number | null = null;

  const flushPendingRemoved = () => {
    if (!pendingRemoved) return;
    for (let i = 0; i < pendingRemoved.length; i++) {
      const line = pendingRemoved[i] ?? "";
      const idx = rows.length;
      rows.push({
        index: idx,
        kind: "removed",
        leftLineNo: (pendingRemovedStartLineNo ?? 1) + i,
        rightLineNo: null,
        leftHtml: `<span class="td_line_del">${escapeHtml(line) || "&nbsp;"}</span>`,
        rightHtml: "&nbsp;",
        unifiedHtml: `<div class="td_unified_row"><div class="td_unified_del">- ${escapeHtml(line)}</div></div>`,
      });
      changeIndexes.push(idx);
    }
    pendingRemoved = null;
    pendingRemovedStartLineNo = null;
  };

  for (const block of diffBlocks) {
    const n = countLinesFromDiffValue(block.value);

    if (block.removed) {
      pendingRemovedStartLineNo = lPtr + 1;
      pendingRemoved = takeLeft(n);
      deletions += n;
      continue;
    }

    if (block.added) {
      const addedLines = takeRight(n);
      additions += n;

      if (pendingRemoved) {
        // changed rows: pair removed + added
        const removedLines = pendingRemoved;
        const removedStart = pendingRemovedStartLineNo ?? 1;

        const max = Math.max(removedLines.length, addedLines.length);
        for (let i = 0; i < max; i++) {
          const oldLine = removedLines[i] ?? "";
          const newLine = addedLines[i] ?? "";
          const intra = intraLineHtml(oldLine, newLine);
          charAdditions += intra.charAdds;
          charDeletions += intra.charDels;

          const idx = rows.length;
          rows.push({
            index: idx,
            kind: "changed",
            leftLineNo: i < removedLines.length ? removedStart + i : null,
            rightLineNo: i < addedLines.length ? rPtr - addedLines.length + i + 1 : null,
            leftHtml:
              i < removedLines.length
                ? `<span class="td_line_del">${intra.left || "&nbsp;"}</span>`
                : "&nbsp;",
            rightHtml:
              i < addedLines.length
                ? `<span class="td_line_add">${intra.right || "&nbsp;"}</span>`
                : "&nbsp;",
            unifiedHtml: `
              <div class="td_unified_row">
                <div class="td_unified_del">- ${escapeHtml(oldLine)}</div>
                <div class="td_unified_add">+ ${escapeHtml(newLine)}</div>
              </div>
            `,
          });
          changed++;
          changeIndexes.push(idx);
        }

        pendingRemoved = null;
        pendingRemovedStartLineNo = null;
      } else {
        // pure added
        for (let i = 0; i < addedLines.length; i++) {
          const line = addedLines[i] ?? "";
          const idx = rows.length;
          rows.push({
            index: idx,
            kind: "added",
            leftLineNo: null,
            rightLineNo: rPtr - addedLines.length + i + 1,
            leftHtml: "&nbsp;",
            rightHtml: `<span class="td_line_add">${escapeHtml(line) || "&nbsp;"}</span>`,
            unifiedHtml: `<div class="td_unified_row"><div class="td_unified_add">+ ${escapeHtml(line)}</div></div>`,
          });
          changeIndexes.push(idx);
        }
      }
      continue;
    }

    // equal
    flushPendingRemoved();

    const eqLeft = takeLeft(n);
    const eqRight = takeRight(n);
    const max = Math.max(eqLeft.length, eqRight.length);

    for (let i = 0; i < max; i++) {
      const l = eqLeft[i] ?? "";
      const r = eqRight[i] ?? "";
      const idx = rows.length;
      rows.push({
        index: idx,
        kind: "equal",
        leftLineNo: i < eqLeft.length ? lPtr - eqLeft.length + i + 1 : null,
        rightLineNo: i < eqRight.length ? rPtr - eqRight.length + i + 1 : null,
        leftHtml: escapeHtml(l) || "&nbsp;",
        rightHtml: escapeHtml(r) || "&nbsp;",
        unifiedHtml: `<div class="td_unified_row"><div class="td_unified_eq">  ${escapeHtml(r)}</div></div>`,
      });
    }
  }

  flushPendingRemoved();

  return {
    rows,
    changeIndexes,
    summary: {
      additions,
      deletions,
      changed,
      charAdditions,
      charDeletions,
    },
  };
}

function downloadText(filename: string, text: string, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function buildExportHtml(title: string, rows: DiffRow[]) {
  const css = `
    body{font-family:system-ui,Segoe UI,Arial,sans-serif;margin:24px;color:#111827}
    h1{font-size:18px;margin:0 0 12px}
    .wrap{border:1px solid #e5e7eb;border-radius:12px;overflow:hidden}
    .row{display:grid;grid-template-columns:80px 1fr 80px 1fr;border-top:1px solid #f1f5f9}
    .row:first-child{border-top:none}
    .cell{padding:8px 10px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:12px;white-space:pre-wrap}
    .ln{background:#f8fafc;color:#64748b;text-align:right}
    .del{background:#fee2e2}
    .add{background:#dcfce7}
    .intra_del{background:#fecaca}
    .intra_add{background:#bbf7d0}
  `;
  const body = rows
    .map((r) => {
      const leftLn = r.leftLineNo ?? "";
      const rightLn = r.rightLineNo ?? "";
      const left = r.leftHtml
        .replaceAll(`class="td_line_del"`, `class="del"`)
        .replaceAll(`class="td_line_add"`, `class="add"`)
        .replaceAll(`class="td_intra_del"`, `class="intra_del"`)
        .replaceAll(`class="td_intra_add"`, `class="intra_add"`);
      const right = r.rightHtml
        .replaceAll(`class="td_line_del"`, `class="del"`)
        .replaceAll(`class="td_line_add"`, `class="add"`)
        .replaceAll(`class="td_intra_del"`, `class="intra_del"`)
        .replaceAll(`class="td_intra_add"`, `class="intra_add"`);

      return `
        <div class="row">
          <div class="cell ln">${leftLn}</div>
          <div class="cell">${left}</div>
          <div class="cell ln">${rightLn}</div>
          <div class="cell">${right}</div>
        </div>
      `;
    })
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"/><title>${escapeHtml(
    title
  )}</title><style>${css}</style></head><body><h1>${escapeHtml(
    title
  )}</h1><div class="wrap">${body}</div></body></html>`;
}

export default function TextDiffChecker() {
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [ignoreWhitespace, setIgnoreWhitespace] = useState(true);
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [trimLines, setTrimLines] = useState(false);

  const [computed, setComputed] = useState<{ rows: DiffRow[]; summary: Summary; changeIndexes: number[] } | null>(null);
  const [activeChange, setActiveChange] = useState<number>(0);

  const scrollParentRef = useRef<HTMLDivElement | null>(null);

  const rows = computed?.rows ?? [];
  const summary = computed?.summary;
  const changeIndexes = computed?.changeIndexes ?? [];

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollParentRef.current,
    estimateSize: () => 26,
    overscan: 20,
  });

  // when rows change, reset active change
  useEffect(() => {
    setActiveChange(0);
  }, [computed?.rows?.length]);

  const jumpToChange = (dir: 1 | -1) => {
    if (!changeIndexes.length) return;
    const next = Math.min(Math.max(activeChange + dir, 0), changeIndexes.length - 1);
    setActiveChange(next);
    const rowIndex = changeIndexes[next];
    virtualizer.scrollToIndex(rowIndex, { align: "center" });
  };

  const runCompare = () => {
    const result = buildDiffRows({
      leftText: left,
      rightText: right,
      ignoreWhitespace,
      ignoreCase,
      trimLines,
    });
    setComputed(result);
  };

  const copyCleanVersion = async () => {
    try {
      await navigator.clipboard.writeText(right);
      alert("Copied clean version (right side) to clipboard.");
    } catch {
      alert("Copy failed. Your browser may block clipboard access.");
    }
  };

  const exportHtml = () => {
    const title = "Text Diff Export";
    const html = buildExportHtml(title, rows);
    downloadText("text-diff.html", html, "text/html;charset=utf-8");
  };

  const printPdf = () => {
    // Browser print => Save as PDF
    const title = "Text Diff Export";
    const html = buildExportHtml(title, rows);
    const w = window.open("", "_blank");
    if (!w) return alert("Popup blocked. Allow popups to export as PDF.");
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
    w.print();
  };

  const minimapTicks = useMemo(() => {
    if (!rows.length) return [];
    // create tick positions in percentage
    const ticks: { topPct: number; kind: "added" | "removed" | "changed" }[] = [];
    for (let i = 0; i < rows.length; i++) {
      const k = rows[i].kind;
      if (k === "added" || k === "removed" || k === "changed") {
        ticks.push({ topPct: (i / Math.max(rows.length - 1, 1)) * 100, kind: k });
      }
    }
    return ticks;
  }, [rows]);

  const minimapJump = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const pct = (e.clientY - rect.top) / rect.height;
    const idx = Math.round(pct * (rows.length - 1));
    virtualizer.scrollToIndex(Math.max(0, Math.min(rows.length - 1, idx)), { align: "center" });
  };

  return (
    <div className="td_wrap">
      <div className="td_header">
        <div>
          <div className="td_title">Text Diff Checker</div>
          <div className="td_sub">Enterprise-style side-by-side diff with inline highlights, minimap, export and jump navigation.</div>
        </div>

        <div className="td_controls">
          <button className="td_btn" onClick={runCompare}>Compare</button>
          <button className="td_btn_secondary" onClick={copyCleanVersion} disabled={!right}>Copy Clean Version</button>
          <button className="td_btn_secondary" onClick={exportHtml} disabled={!rows.length}>Export HTML</button>
          <button className="td_btn_secondary" onClick={printPdf} disabled={!rows.length}>Export PDF</button>
        </div>
      </div>

      <div className="td_topbar">
        <div className="td_toggle_row">
          <label className="td_check">
            <input type="checkbox" checked={ignoreWhitespace} onChange={(e) => setIgnoreWhitespace(e.target.checked)} />
            Ignore Whitespace
          </label>
          <label className="td_check">
            <input type="checkbox" checked={ignoreCase} onChange={(e) => setIgnoreCase(e.target.checked)} />
            Ignore Case
          </label>
          <label className="td_check">
            <input type="checkbox" checked={trimLines} onChange={(e) => setTrimLines(e.target.checked)} />
            Trim Lines
          </label>

          <div className="td_divider" />

          <div className="td_segment">
            <button className={viewMode === "side-by-side" ? "td_seg_active" : "td_seg"} onClick={() => setViewMode("side-by-side")}>
              Side-by-Side
            </button>
            <button className={viewMode === "unified" ? "td_seg_active" : "td_seg"} onClick={() => setViewMode("unified")}>
              Unified
            </button>
          </div>
        </div>

        <div className="td_summary">
          <div className="td_sum_title">Comparison Summary</div>
          <div className="td_sum_grid">
            <div className="td_kpi">
              <div className="td_kpi_num">{summary?.additions ?? 0}</div>
              <div className="td_kpi_label">Additions (lines)</div>
            </div>
            <div className="td_kpi">
              <div className="td_kpi_num">{summary?.deletions ?? 0}</div>
              <div className="td_kpi_label">Deletions (lines)</div>
            </div>
            <div className="td_kpi">
              <div className="td_kpi_num">{summary?.changed ?? 0}</div>
              <div className="td_kpi_label">Changed rows</div>
            </div>
            <div className="td_kpi">
              <div className="td_kpi_num">{(summary?.charAdditions ?? 0) + (summary?.charDeletions ?? 0)}</div>
              <div className="td_kpi_label">Character changes</div>
            </div>
          </div>

          <div className="td_jump_row">
            <button className="td_btn_small" onClick={() => jumpToChange(-1)} disabled={!changeIndexes.length}>
              ◀ Prev
            </button>
            <div className="td_jump_text">
              Change {changeIndexes.length ? activeChange + 1 : 0} / {changeIndexes.length}
            </div>
            <button className="td_btn_small" onClick={() => jumpToChange(1)} disabled={!changeIndexes.length}>
              Next ▶
            </button>
          </div>
        </div>
      </div>

      <div className="td_editors">
        <div className="td_editor">
          <div className="td_editor_label">Original (Left)</div>
          <textarea className="td_textarea" value={left} onChange={(e) => setLeft(e.target.value)} placeholder="Paste original text here..." />
        </div>
        <div className="td_editor">
          <div className="td_editor_label">Modified (Right)</div>
          <textarea className="td_textarea" value={right} onChange={(e) => setRight(e.target.value)} placeholder="Paste modified text here..." />
        </div>
      </div>

      <div className="td_results_shell">
        <div className="td_results_header">
          <div className="td_results_title">Diff Results</div>
          <div className="td_results_hint">
            Inline highlights: <span className="td_hint_del">deletions</span> (left) and <span className="td_hint_add">additions</span> (right).
          </div>
        </div>

        <div className="td_results_body">
          <div className="td_results_scroll" ref={scrollParentRef}>
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map((vItem) => {
                const r = rows[vItem.index];
                const isChange = r?.kind !== "equal";
                const isActiveRow = changeIndexes.length ? (r?.index === changeIndexes[activeChange]) : false;

                return (
                  <div
                    key={r.index}
                    className={`td_row ${isChange ? "td_row_change" : ""} ${isActiveRow ? "td_row_active" : ""}`}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${vItem.start}px)`,
                    }}
                  >
                    {viewMode === "side-by-side" ? (
                      <>
                        <div className="td_ln">{r.leftLineNo ?? ""}</div>
                        <div className="td_cell" dangerouslySetInnerHTML={{ __html: r.leftHtml }} />
                        <div className="td_ln">{r.rightLineNo ?? ""}</div>
                        <div className="td_cell" dangerouslySetInnerHTML={{ __html: r.rightHtml }} />
                      </>
                    ) : (
                      <div className="td_unified" dangerouslySetInnerHTML={{ __html: r.unifiedHtml }} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* minimap */}
          <div className="td_minimap" onClick={minimapJump} title="Click to jump">
            {minimapTicks.map((t, i) => (
              <div
                key={i}
                className={`td_tick td_tick_${t.kind}`}
                style={{ top: `${t.topPct}%` }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Component-scoped CSS (no Tailwind dependency) */}
      <style jsx>{`
        .td_wrap { padding: 28px 24px; max-width: 1200px; margin: 0 auto; }
        .td_header { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; flex-wrap:wrap; }
        .td_title { font-size: 22px; font-weight: 900; color:#0f172a; }
        .td_sub { margin-top: 6px; font-size: 13px; color:#64748b; max-width: 720px; line-height: 1.5; }
        .td_controls { display:flex; gap:10px; flex-wrap:wrap; }
        .td_btn { background:#0f172a; color:white; border:none; padding:10px 14px; border-radius:12px; font-weight:900; cursor:pointer; }
        .td_btn:disabled { opacity:0.5; cursor:not-allowed; }
        .td_btn_secondary { background:white; color:#0f172a; border:1px solid #e5e7eb; padding:10px 14px; border-radius:12px; font-weight:900; cursor:pointer; }
        .td_btn_secondary:disabled { opacity:0.5; cursor:not-allowed; }

        .td_topbar { margin-top: 16px; display:grid; grid-template-columns: 1.4fr 1fr; gap: 14px; }
        @media (max-width: 980px) { .td_topbar { grid-template-columns: 1fr; } }

        .td_toggle_row { display:flex; gap:12px; flex-wrap:wrap; align-items:center; border:1px solid #e5e7eb; background:white; border-radius:16px; padding:12px; }
        .td_check { font-size: 13px; color:#0f172a; display:flex; gap:8px; align-items:center; font-weight: 700; }
        .td_divider { width:1px; height:22px; background:#e5e7eb; }

        .td_segment { display:inline-flex; background:#f8fafc; border:1px solid #e5e7eb; border-radius: 999px; overflow:hidden; }
        .td_seg { padding:8px 12px; font-size:12px; font-weight:900; background:transparent; border:none; cursor:pointer; color:#334155; }
        .td_seg_active { padding:8px 12px; font-size:12px; font-weight:900; background:#0f172a; border:none; cursor:pointer; color:white; }

        .td_summary { border:1px solid #e5e7eb; background:white; border-radius:16px; padding:12px; }
        .td_sum_title { font-weight: 950; font-size: 13px; color:#0f172a; }
        .td_sum_grid { margin-top: 10px; display:grid; grid-template-columns: repeat(2, 1fr); gap:10px; }
        .td_kpi { border:1px solid #f1f5f9; background:#f8fafc; border-radius:14px; padding:10px; }
        .td_kpi_num { font-size: 18px; font-weight: 950; color:#0f172a; }
        .td_kpi_label { font-size: 11px; color:#64748b; font-weight: 800; }

        .td_jump_row { margin-top: 10px; display:flex; align-items:center; justify-content:space-between; gap:10px; }
        .td_btn_small { padding:8px 10px; border-radius:12px; border:1px solid #e5e7eb; background:white; font-weight:900; cursor:pointer; }
        .td_btn_small:disabled { opacity:0.5; cursor:not-allowed; }
        .td_jump_text { font-size: 12px; color:#334155; font-weight: 900; }

        .td_editors { margin-top: 14px; display:grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        @media (max-width: 980px) { .td_editors { grid-template-columns: 1fr; } }
        .td_editor { border:1px solid #e5e7eb; background:white; border-radius:18px; padding:12px; }
        .td_editor_label { font-weight: 950; font-size: 12px; color:#0f172a; margin-bottom: 8px; }
        .td_textarea { width:100%; min-height: 180px; resize: vertical; border-radius: 14px; border:1px solid #e5e7eb; padding:12px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; background:#fcfcfd; }

        .td_results_shell { margin-top: 14px; border:1px solid #e5e7eb; background:white; border-radius:18px; overflow:hidden; }
        .td_results_header { padding:12px; border-bottom: 1px solid #f1f5f9; display:flex; justify-content:space-between; gap:12px; align-items:center; flex-wrap:wrap; }
        .td_results_title { font-weight: 950; color:#0f172a; }
        .td_results_hint { font-size: 12px; color:#64748b; font-weight: 800; }
        .td_hint_del { background:#fee2e2; padding:2px 8px; border-radius:999px; border:1px solid #fecaca; color:#991b1b; }
        .td_hint_add { background:#dcfce7; padding:2px 8px; border-radius:999px; border:1px solid #bbf7d0; color:#166534; }

        .td_results_body { display:grid; grid-template-columns: 1fr 18px; }
        .td_results_scroll { height: 520px; overflow:auto; position:relative; background:#ffffff; }
        .td_minimap { position:relative; background:#f8fafc; border-left:1px solid #e5e7eb; cursor:pointer; }
        .td_tick { position:absolute; left:2px; right:2px; height:3px; border-radius:999px; }
        .td_tick_added { background:#22c55e; opacity:0.8; }
        .td_tick_removed { background:#ef4444; opacity:0.8; }
        .td_tick_changed { background:#a855f7; opacity:0.8; }

        .td_row { display:grid; grid-template-columns: 64px 1fr 64px 1fr; gap:0; border-top:1px solid #f1f5f9; }
        .td_row:first-child { border-top:none; }
        .td_ln { padding:8px 10px; background:#f8fafc; color:#64748b; text-align:right; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; user-select:none; }
        .td_cell { padding:8px 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; white-space:pre-wrap; word-break:break-word; }

        .td_row_change { background: #fff; }
        .td_row_active { outline: 2px solid rgba(37,99,235,0.35); outline-offset: -2px; }

        .td_unified { grid-column: 1 / -1; padding:8px 10px; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size:12px; white-space:pre-wrap; word-break:break-word; }
        :global(.td_unified_row) { border-top:1px solid #f1f5f9; padding-top:6px; margin-top:6px; }
        :global(.td_unified_del) { background:#fee2e2; border:1px solid #fecaca; border-radius:10px; padding:6px 8px; }
        :global(.td_unified_add) { background:#dcfce7; border:1px solid #bbf7d0; border-radius:10px; padding:6px 8px; margin-top:6px; }
        :global(.td_unified_eq) { color:#0f172a; }

        /* highlight styles */
        :global(.td_line_del) { background:#fee2e2; border:1px solid #fecaca; border-radius:10px; padding:2px 6px; display:inline-block; }
        :global(.td_line_add) { background:#dcfce7; border:1px solid #bbf7d0; border-radius:10px; padding:2px 6px; display:inline-block; }
        :global(.td_intra_del) { background:#fecaca; border-radius:8px; padding:0 2px; }
        :global(.td_intra_add) { background:#bbf7d0; border-radius:8px; padding:0 2px; }
      `}</style>
    </div>
  );
}
