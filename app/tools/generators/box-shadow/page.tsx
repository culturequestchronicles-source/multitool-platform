"use client";

import { useMemo, useState } from "react";
import { trackUsage } from "../../../../lib/track";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function BoxShadowGeneratorPage() {
  const [x, setX] = useState(0);
  const [y, setY] = useState(12);
  const [blur, setBlur] = useState(24);
  const [spread, setSpread] = useState(0);
  const [opacity, setOpacity] = useState(0.18);
  const [color, setColor] = useState("#000000");

  const [status, setStatus] = useState("");

  const css = useMemo(() => {
    const a = clamp(opacity, 0, 1);
    // Convert hex to rgba
    const hex = color.replace("#", "");
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return `box-shadow: ${x}px ${y}px ${blur}px ${spread}px rgba(${r}, ${g}, ${b}, ${a});`;
  }, [x, y, blur, spread, opacity, color]);

  const previewStyle: React.CSSProperties = useMemo(
    () => ({
      width: 260,
      height: 160,
      borderRadius: 18,
      background: "white",
      border: "1px solid #eef2f7",
      boxShadow: css.replace("box-shadow:", "").replace(";", "") as any,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: 800,
      color: "#111827",
    }),
    [css]
  );

  async function copy() {
    await navigator.clipboard.writeText(css);
    setStatus("Copied CSS ✅");
    trackUsage("box-shadow-generator", "copy", { css });
  }

  function download() {
    const blob = new Blob([`.card {\n  ${css}\n}\n`], { type: "text/css" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "box-shadow.css";
    a.click();
    URL.revokeObjectURL(url);
    setStatus("Downloaded box-shadow.css ✅");
    trackUsage("box-shadow-generator", "download", { css });
  }

  function randomize() {
    setX(Math.floor(Math.random() * 41) - 20);
    setY(Math.floor(Math.random() * 41) - 10);
    setBlur(Math.floor(Math.random() * 60) + 10);
    setSpread(Math.floor(Math.random() * 20) - 5);
    setOpacity(Math.round((Math.random() * 0.35 + 0.05) * 100) / 100);
    trackUsage("box-shadow-generator", "randomize");
    setStatus("");
  }

  return (
    <main style={{ padding: 40, maxWidth: 1000 }}>
      <h1 style={{ fontSize: 32, fontWeight: 900 }}>Box Shadow CSS Generator</h1>
      <p style={{ color: "#6b7280", marginTop: 6 }}>
        Create beautiful shadows. Preview instantly. Copy or download CSS.
      </p>

      <div style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 360px", gap: 18 }}>
        <div style={panel}>
          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <pre style={codeBox}>{css}</pre>

            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={copy} style={btnPrimary}>Copy</button>
              <button onClick={download} style={btn}>Download</button>
              <button onClick={randomize} style={btn}>Random</button>
            </div>
          </div>

          {status && <p style={{ marginTop: 10 }}>{status}</p>}

          <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
            <Slider label="X offset" value={x} min={-50} max={50} step={1} onChange={setX} />
            <Slider label="Y offset" value={y} min={-50} max={50} step={1} onChange={setY} />
            <Slider label="Blur" value={blur} min={0} max={120} step={1} onChange={setBlur} />
            <Slider label="Spread" value={spread} min={-30} max={30} step={1} onChange={setSpread} />
            <Slider label="Opacity" value={opacity} min={0} max={1} step={0.01} onChange={setOpacity} />

            <div style={card}>
              <label style={label}>Color</label>
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: "100%", height: 44 }} />
              <p style={hint}>Pick the shadow color.</p>
            </div>
          </div>
        </div>

        <div style={panel}>
          <h3 style={{ marginTop: 0 }}>Preview</h3>
          <div style={{ display: "flex", justifyContent: "center", marginTop: 14 }}>
            <div style={previewStyle}>Card</div>
          </div>
          <p style={{ color: "#6b7280", marginTop: 14, fontSize: 12 }}>
            Tip: Increase blur and lower opacity for modern shadows.
          </p>
        </div>
      </div>
    </main>
  );
}

function Slider({
  label: labelText,
  value,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (n: number) => void;
}) {
  return (
    <div style={card}>
      <label style={label}>
        {labelText}: <span style={{ color: "#2563eb" }}>{value}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        style={{ width: "100%" }}
      />
      <p style={hint}>
        {min} to {max}
      </p>
    </div>
  );
}

const panel: React.CSSProperties = {
  padding: 16,
  border: "1px solid #e5e7eb",
  borderRadius: 16,
  background: "white",
};

const codeBox: React.CSSProperties = {
  margin: 0,
  padding: "12px 14px",
  borderRadius: 12,
  border: "1px solid #e5e7eb",
  background: "#0b1220",
  color: "white",
  fontSize: 13,
  overflowX: "auto",
  flex: 1,
  minWidth: 280,
};

const btnPrimary: React.CSSProperties = {
  background: "#2563eb",
  color: "white",
  border: "none",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
};

const btn: React.CSSProperties = {
  background: "white",
  color: "#111827",
  border: "1px solid #e5e7eb",
  padding: "10px 14px",
  borderRadius: 10,
  fontWeight: 700,
  cursor: "pointer",
};

const card: React.CSSProperties = {
  padding: 14,
  border: "1px solid #e5e7eb",
  borderRadius: 14,
  background: "white",
};

const label: React.CSSProperties = { fontWeight: 800, color: "#111827" };
const hint: React.CSSProperties = { marginTop: 8, fontSize: 12, color: "#6b7280" };
