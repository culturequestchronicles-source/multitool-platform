import ToolCard from "@/components/ToolCard";
import type { Metadata } from "next";
import { absUrl } from "@/lib/seo/site";

export const metadata: Metadata = {
  title: "Generators — Passwords, GUIDs, Slugs, Dummy Data | Jhatpat",
  description:
    "Generators for passwords, GUIDs/UUIDs, slugs, dummy datasets, TinyURL links, and CSS snippets.",
  alternates: { canonical: absUrl("/tools/generators") },
  openGraph: {
    title: "Generators — Jhatpat",
    description: "Generate passwords, GUIDs, slugs, dummy data, and more in seconds.",
    url: absUrl("/tools/generators"),
    type: "website",
  },
  robots: { index: true, follow: true },
};

export default function GeneratorsHubPage() {
  return (
    <main style={{ background: "#f9fafb", minHeight: "100vh" }}>
      <section style={{ padding: 40, maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontSize: 36, fontWeight: 900 }}>🧰 Generators</h1>
        <p style={{ color: "#6b7280", marginTop: 10 }}>
          Create IDs, passwords, CSS snippets, slugs, dummy data, and short links.
        </p>

        <div style={grid}>
          <ToolCard
            title="GUID Generator"
            description="Generate UUID v4 values in bulk"
            href="/tools/generators/guid"
            icon="🆔"
          />
          <ToolCard
            title="Password Generator"
            description="Generate strong random passwords"
            href="/tools/generators/password"
            icon="🔐"
          />
          <ToolCard
            title="Slug Generator"
            description="Create clean URL slugs from any text"
            href="/tools/generators/slug"
            icon="🔗"
          />
          <ToolCard
            title="TinyURL Generator"
            description="Shorten a reachable URL into a /t/ link"
            href="/tools/generators/tinyurl"
            icon="✂️"
          />
          <ToolCard
            title="Dummy Data Generator"
            description="Generate test datasets (JSON/CSV/SQL/XML)"
            href="/tools/generators/dummy-data"
            icon="🧪"
          />
          <ToolCard
            title="Box Shadow Generator"
            description="Build CSS box-shadow values with live preview"
            href="/tools/generators/box-shadow"
            icon="🎨"
          />
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
