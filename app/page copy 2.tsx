import ToolCard from "@/components/ToolCard";

export default function Home() {
  return (
    <main className="max-w-6xl mx-auto p-6">
      <h1 className="text-4xl font-bold mb-4">
        Free CSV, Excel & PDF Tools
      </h1>

      <p className="text-gray-600 mb-8">
        Convert, compare, and analyze files online.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <ToolCard title="CSV to JSON" href="/tools/csv-to-json" icon="📄" />
        <ToolCard title="JSON to CSV" href="/tools/json-to-csv" icon="🔁" />
        <ToolCard title="CSV Diff" href="/tools/csv-diff" icon="🔍" />
        <ToolCard title="PDF Merge" href="/tools/pdf/merge" icon="📑" />
      </div>
    </main>
  );
}
