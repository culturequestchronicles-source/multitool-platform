import ToolCard from "@/components/ToolCard";

export default function GeneratorsHubPage() {
  return (
    <main style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <section style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900 }}>🧰 Generators</h1>
        <p style={{ color: "#6b7280", marginTop: 10 }}>
          Create IDs, passwords, CSS snippets, slugs, dummy data, and AI prompts.
        </p>

        <div style={grid}>
          <ToolCard
            title="GUID Generator"
            description="Generate unique IDs (UUID v4/v1-like)"
            href="/tools/generators/guid"
            icon="🆔"
          />
          {/* We will add the rest one-by-one next */}
        </div>
      </section>
    </main>
  );
}

const grid = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
  gap: 20,
  marginTop: 24,
};
