import Link from "next/link";

export default function ToolCard({ title, href, icon }) {
  return (
    <Link href={href} className="border p-4 rounded hover:shadow">
      <div className="text-3xl">{icon}</div>
      <h3 className="font-semibold mt-2">{title}</h3>
    </Link>
  );
}
