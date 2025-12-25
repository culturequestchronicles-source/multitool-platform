import Link from "next/link";

type ToolCardProps = {
  title: string;
  description: string;
  href: string;
  icon?: string;
};

export default function ToolCard({
  title,
  description,
  href,
  icon = "⚡",
}: ToolCardProps) {
  return (
    <Link
      href={href}
      style={{
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 20,
        background: "white",
        textDecoration: "none",
        color: "#111827",
        transition: "all 0.2s ease",
        boxShadow: "0 8px 24px rgba(0,0,0,0.04)",
      }}
    >
      <div style={{ fontSize: 28 }}>{icon}</div>
      <h3 style={{ fontSize: 18, marginTop: 12 }}>{title}</h3>
      <p style={{ fontSize: 14, color: "#6b7280" }}>{description}</p>
      <p style={{ marginTop: 12, fontWeight: 600 }}>Open tool →</p>
    </Link>
  );
}
