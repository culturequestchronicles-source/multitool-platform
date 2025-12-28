"use client";

import { useEffect, useMemo, useState } from "react";

type Strength = "Weak" | "Okay" | "Strong" | "Very Strong";

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function hasAny(s: string, chars: string) {
  for (const c of s) if (chars.includes(c)) return true;
  return false;
}

function estimateStrength(pw: string): { label: Strength; score: number } {
  // Simple, predictable heuristic (no external libs)
  let score = 0;

  const length = pw.length;
  if (length >= 8) score += 1;
  if (length >= 12) score += 1;
  if (length >= 16) score += 1;

  const lowers = "abcdefghijklmnopqrstuvwxyz";
  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>/?|~";

  const hasLower = hasAny(pw, lowers);
  const hasUpper = hasAny(pw, uppers);
  const hasDigit = hasAny(pw, digits);
  const hasSymbol = hasAny(pw, symbols);

  const variety = [hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length;
  score += variety; // up to +4

  // Penalize obvious patterns
  if (/^(.)\1+$/.test(pw)) score = Math.max(0, score - 2); // same char repeated
  if (/password|qwerty|1234|admin/i.test(pw)) score = Math.max(0, score - 2);

  const normalized = clamp(Math.round((score / 7) * 100), 0, 100);

  let label: Strength = "Weak";
  if (normalized >= 85) label = "Very Strong";
  else if (normalized >= 65) label = "Strong";
  else if (normalized >= 40) label = "Okay";

  return { label, score: normalized };
}

function secureRandomInt(maxExclusive: number) {
  // Works in modern browsers
  const arr = new Uint32Array(1);
  crypto.getRandomValues(arr);
  return arr[0] % maxExclusive;
}

function shuffle<T>(arr: T[]) {
  // Fisher-Yates
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = secureRandomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generatePassword(opts: {
  length: number;
  lower: boolean;
  upper: boolean;
  digits: boolean;
  symbols: boolean;
  noAmbiguous: boolean;
}) {
  const lowers = "abcdefghijklmnopqrstuvwxyz";
  const uppers = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const digits = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{};:,.<>/?|~";

  const ambiguous = new Set(["O", "0", "I", "l", "1"]);
  const filterAmbiguous = (s: string) =>
    opts.noAmbiguous ? [...s].filter((c) => !ambiguous.has(c)).join("") : s;

  const pools: { enabled: boolean; chars: string }[] = [
    { enabled: opts.lower, chars: filterAmbiguous(lowers) },
    { enabled: opts.upper, chars: filterAmbiguous(uppers) },
    { enabled: opts.digits, chars: filterAmbiguous(digits) },
    { enabled: opts.symbols, chars: filterAmbiguous(symbols) },
  ];

  const enabledPools = pools.filter((p) => p.enabled && p.chars.length > 0);
  if (enabledPools.length === 0) {
    throw new Error("Select at least one character type.");
  }

  const length = clamp(opts.length, enabledPools.length, 128);

  // Guarantee at least one from each selected pool
  const requiredChars: string[] = enabledPools.map((p) => {
    const i = secureRandomInt(p.chars.length);
    return p.chars[i];
  });

  const allChars = enabledPools.map((p) => p.chars).join("");
  const remaining = length - requiredChars.length;

  const rest: string[] = [];
  for (let i = 0; i < remaining; i++) {
    const idx = secureRandomInt(allChars.length);
    rest.push(allChars[idx]);
  }

  const final = shuffle([...requiredChars, ...rest]).join("");
  return final;
}

async function optionalTrack(event: {
  tool: string;
  action: string;
  meta?: Record<string, unknown>;
}) {
  // Optional: if /api/track exists, it will log. If not, fail silently.
  try {
    await fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
  } catch {
    // ignore
  }
}

export default function PasswordGeneratorPage() {
  const [length, setLength] = useState(16);
  const [lower, setLower] = useState(true);
  const [upper, setUpper] = useState(true);
  const [digits, setDigits] = useState(true);
  const [symbols, setSymbols] = useState(true);
  const [noAmbiguous, setNoAmbiguous] = useState(false);

  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [copied, setCopied] = useState(false);

  const strength = useMemo(() => estimateStrength(password), [password]);

  function regen() {
    setStatus("");
    setCopied(false);

    try {
      const pw = generatePassword({
        length,
        lower,
        upper,
        digits,
        symbols,
        noAmbiguous,
      });
      setPassword(pw);
      optionalTrack({
        tool: "password-generator",
        action: "generate",
        meta: {
          length,
          lower,
          upper,
          digits,
          symbols,
          noAmbiguous,
        },
      });
    } catch (e: unknown) {
      setPassword("");
      const message =
        e instanceof Error ? e.message : "Unable to generate password";
      setStatus(message);
    }
  }

  useEffect(() => {
    // Generate one on first load
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function copy() {
    if (!password) return;
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setStatus("Copied to clipboard ✅");
    optionalTrack({ tool: "password-generator", action: "copy" });
    setTimeout(() => setCopied(false), 1200);
  }

  function download() {
    if (!password) return;

    const content = `Strong Password Generator\n\nPassword:\n${password}\n\nLength: ${length}\nIncludes: ${
      [lower && "lowercase", upper && "uppercase", digits && "digits", symbols && "symbols"]
        .filter(Boolean)
        .join(", ") || "none"
    }\nAmbiguous chars removed: ${noAmbiguous ? "yes" : "no"}\n\nGenerated on: ${new Date().toISOString()}\n`;

    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "password.txt";
    a.click();

    URL.revokeObjectURL(url);

    setStatus("Downloaded password.txt ✅");
    optionalTrack({ tool: "password-generator", action: "download" });
  }

  const meterWidth = `${strength.score}%`;
  const meterColor =
    strength.label === "Very Strong"
      ? "#16a34a"
      : strength.label === "Strong"
      ? "#22c55e"
      : strength.label === "Okay"
      ? "#f59e0b"
      : "#ef4444";

  return (
    <main style={{ padding: 40, maxWidth: 980, margin: "0 auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: 34, fontWeight: 900, margin: 0 }}>Strong Password Generator</h1>
          <p style={{ color: "#6b7280", marginTop: 8 }}>
            Create secure passwords instantly. Copy, download, and customize rules.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <button
            onClick={regen}
            style={{
              background: "#111827",
              color: "white",
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            Generate
          </button>
          <button
            onClick={copy}
            disabled={!password}
            style={{
              background: copied ? "#16a34a" : "#2563eb",
              color: "white",
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              cursor: password ? "pointer" : "not-allowed",
              fontWeight: 700,
              opacity: password ? 1 : 0.6,
            }}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
          <button
            onClick={download}
            disabled={!password}
            style={{
              background: "#f3f4f6",
              color: "#111827",
              padding: "12px 16px",
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              cursor: password ? "pointer" : "not-allowed",
              fontWeight: 700,
              opacity: password ? 1 : 0.6,
            }}
          >
            Download
          </button>
        </div>
      </div>

      {/* Password output */}
      <div
        style={{
          marginTop: 18,
          padding: 18,
          borderRadius: 16,
          border: "1px solid #e5e7eb",
          background: "white",
          boxShadow: "0 10px 20px rgba(0,0,0,0.03)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>Generated password</div>
            <div
              style={{
                fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 0.6,
                wordBreak: "break-all",
              }}
            >
              {password || "—"}
            </div>
          </div>
          <div style={{ minWidth: 260 }}>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 8 }}>
              Strength: <b style={{ color: "#111827" }}>{strength.label}</b>
            </div>
            <div
              style={{
                height: 10,
                background: "#f3f4f6",
                borderRadius: 999,
                overflow: "hidden",
                border: "1px solid #e5e7eb",
              }}
            >
              <div style={{ width: meterWidth, height: "100%", background: meterColor }} />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: "#6b7280" }}>
              Tip: Prefer 16+ characters with mixed types.
            </div>
          </div>
        </div>
      </div>

      {/* Options */}
      <div
        style={{
          marginTop: 18,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 14,
        }}
      >
        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Length</div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <input
              type="range"
              min={8}
              max={64}
              value={length}
              onChange={(e) => setLength(Number(e.target.value))}
              style={{ width: "100%" }}
            />
            <div
              style={{
                minWidth: 44,
                textAlign: "center",
                padding: "6px 10px",
                borderRadius: 10,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                fontWeight: 800,
              }}
            >
              {length}
            </div>
          </div>
          <div style={{ marginTop: 10, fontSize: 12, color: "#6b7280" }}>
            Minimum 8; recommended 16–24.
          </div>
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Character Sets</div>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input type="checkbox" checked={lower} onChange={() => setLower((v) => !v)} />
            <span>Lowercase (a-z)</span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input type="checkbox" checked={upper} onChange={() => setUpper((v) => !v)} />
            <span>Uppercase (A-Z)</span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
            <input type="checkbox" checked={digits} onChange={() => setDigits((v) => !v)} />
            <span>Digits (0-9)</span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <input type="checkbox" checked={symbols} onChange={() => setSymbols((v) => !v)} />
            <span>Symbols (!@#$...)</span>
          </label>

          <label style={{ display: "flex", gap: 10, alignItems: "center", marginTop: 12 }}>
            <input
              type="checkbox"
              checked={noAmbiguous}
              onChange={() => setNoAmbiguous((v) => !v)}
            />
            <span>Remove ambiguous characters (O/0, I/l/1)</span>
          </label>
        </div>

        <div
          style={{
            padding: 16,
            borderRadius: 16,
            border: "1px solid #e5e7eb",
            background: "white",
          }}
        >
          <div style={{ fontWeight: 900, marginBottom: 10 }}>Quick Actions</div>
          <div style={{ display: "grid", gap: 10 }}>
            <button
              onClick={() => {
                setLength(24);
                setLower(true);
                setUpper(true);
                setDigits(true);
                setSymbols(true);
                setNoAmbiguous(false);
                setStatus("Preset applied (24 chars, all types)");
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Recommended preset (24 chars)
            </button>

            <button
              onClick={() => {
                setLength(16);
                setLower(true);
                setUpper(true);
                setDigits(true);
                setSymbols(false);
                setNoAmbiguous(true);
                setStatus("Preset applied (easy-to-read)");
              }}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                background: "#f9fafb",
                cursor: "pointer",
                fontWeight: 800,
              }}
            >
              Easy-to-read preset (no symbols)
            </button>
          </div>

          {status && (
            <div style={{ marginTop: 12, color: "#111827", fontSize: 13 }}>
              {status}
            </div>
          )}
        </div>
      </div>

      {/* Small note */}
      <div style={{ marginTop: 18, fontSize: 12, color: "#6b7280" }}>
        Security note: Passwords are generated locally in your browser using <code>crypto.getRandomValues</code>.
        Optional tracking only logs anonymous usage events (no password content).
      </div>
    </main>
  );
}
