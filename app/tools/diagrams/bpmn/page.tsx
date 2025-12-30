import Link from "next/link";

export const dynamic = "force-dynamic";

export default function BpmnLanding() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold">BPMN Diagramming</h1>
      <p className="mt-2 text-sm text-gray-600">
        Create BPMN diagrams with subprocess drilldown and swimlanes.
      </p>

      <div className="mt-4">
        <Link className="underline text-sm" href="/tools/diagrams">
          Go to Diagrams →
        </Link>
      </div>
    </div>
  );
}
