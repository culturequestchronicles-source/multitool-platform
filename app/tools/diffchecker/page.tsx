import ToolCard from "@/components/ToolCard";

export default function DiffCheckerHome() {
  return (
    <main style={{ padding: 40 }}>
      <h1 style={{ fontSize: 36, fontWeight: 800 }}>
        🧩 Diff Checkers
      </h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Compare files side-by-side with visual differences
      </p>

      <div style={grid}>
        <ToolCard
          title="Text Diff Checker"
          description="Compare text line-by-line"
          href="/tools/diffchecker/text"
          icon="📝"
        />

        <ToolCard
          title="CSV Diff Checker"
          description="Highlight row & column differences"
          href="/tools/csv-diff"
          icon="📊"
        />

        <ToolCard
          title="Excel Diff Checker"
          description="Compare Excel sheets visually"
          href="/tools/excel-diff"
          icon="📈"
        />
      </div>
    </main>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 24,
  marginTop: 32,
};
