import ToolCard from "@/components/ToolCard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Diff Checkers - Compare Text, CSV, and Excel",
  description: "Free online tools to compare text files, spreadsheets, and data structures side-by-side with visual highlighting.",
};

export default function DiffCheckerHome() {
  return (
    <main style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>🧩 Diff Checkers</h1>
      <p style={{ color: "#6b7280", marginTop: 8, fontSize: 18 }}>
        Compare files side-by-side with visual differences.
      </p>

      <div style={grid}>
        <ToolCard
          title="Text Diff Checker"
          description="Compare text line-by-line"
          href="/tools/diffchecker/text"
          icon="📝"
        />
        
       
      </div>
    </main>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: 24,
  marginTop: 32,
};