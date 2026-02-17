import Link from "next/link";
import type { ReactNode } from "react";

export const metadata = {
  title: "System Architecture Icon Packs - Jhatpat Help",
  description: "How the System Architecture diagram styles load AWS/Azure/GCP icons using local icon pack manifests.",
};

export default function SystemArchitectureIconPacksPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="text-xs font-semibold text-slate-500 uppercase">User Guide</div>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-slate-900">System Architecture Icon Packs</h1>
          <p className="mt-3 text-base leading-7 text-slate-600">
            System Architecture styles (AWS/Azure/Google Cloud) load icons from local manifests under{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px]">public/icon-packs/</code>.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/help/diagrams/system-architecture"
              className="rounded-2xl bg-black px-5 py-3 text-sm font-extrabold text-white"
            >
              Back to System Architecture Guide →
            </Link>
            <Link
              href="/tools/diagrams/new?type=system-architecture"
              className="rounded-2xl border bg-white px-5 py-3 text-sm font-bold text-slate-900 hover:bg-slate-50"
            >
              Create Diagram →
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-6 py-10 space-y-8">
        <Block title="1) What is an icon pack?">
          <p className="text-sm leading-6 text-slate-700">
            An icon pack is just a folder of SVG/PNG files in <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/</code>{" "}
            plus a <b>manifest.json</b> that maps node kinds (or custom keys) to icon file paths.
          </p>
          <div className="mt-4 grid grid-cols-1 gap-2 text-sm text-slate-700">
            <div>
              <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">/icon-packs/aws/manifest.json</code>
            </div>
            <div>
              <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">/icon-packs/azure/manifest.json</code>
            </div>
            <div>
              <code className="rounded bg-slate-100 px-2 py-1 text-[11px]">/icon-packs/gcp/manifest.json</code>
            </div>
          </div>
        </Block>

        <Block title="2) Manifest format (example)">
          <p className="text-sm leading-6 text-slate-700">
            Manifests map a key to an icon URL (served from <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/</code>) and an optional <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">alt</code> label.
          </p>
          <pre className="mt-4 overflow-auto rounded-2xl border bg-slate-950 p-4 text-xs text-slate-100">
{`{
  "version": 1,
  "provider": "aws",
  "nodes": {
    "api_gateway": { "src": "/icon-packs/aws/icons/api-gateway.svg", "alt": "Amazon API Gateway" },
    "lambda": { "src": "/icon-packs/aws/icons/lambda.svg", "alt": "AWS Lambda" }
  }
}`}
          </pre>
          <div className="mt-4 text-sm text-slate-700">
            See detailed per-provider notes:
            <span className="ml-2 inline-flex flex-wrap gap-x-3 gap-y-1">
              <Link href="/icon-packs/aws/README.md" className="font-bold underline">
                AWS README
              </Link>
              <Link href="/icon-packs/azure/README.md" className="font-bold underline">
                Azure README
              </Link>
              <Link href="/icon-packs/gcp/README.md" className="font-bold underline">
                Google Cloud README
              </Link>
            </span>
          </div>
        </Block>

        <Block title="3) Which keys can you map?">
          <p className="text-sm leading-6 text-slate-700">
            The most common mapping keys are the app&apos;s System Architecture node kinds (examples:{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">api_gateway</code>,{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">service</code>,{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">sql_db</code>,{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">event_bus</code>).
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            You can also use any custom key and then set it per-node via <b>Properties → Icon Key</b> (stored on the node as{" "}
            <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">meta.iconKey</code>).
          </p>
        </Block>

        <Block title="4) How to add your own AWS/Azure/GCP icons">
          <ol className="list-decimal pl-6 text-sm text-slate-700 space-y-2">
            <li>
              Copy SVG/PNG files into{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/icon-packs/&lt;provider&gt;/icons/</code>.
            </li>
            <li>
              Add/update entries in{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/icon-packs/&lt;provider&gt;/manifest.json</code> so the{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">src</code> points to your new file.
            </li>
            <li>
              In the editor, select <b>Style</b> (left stencil sidebar). If you changed icons while the dev server is running, hard-refresh the page.
            </li>
            <li>
              Optional: set per-node <b>Icon Key</b> in the Properties panel to choose a more specific icon than the default node kind mapping.
            </li>
          </ol>
          <p className="mt-4 text-sm leading-6 text-slate-700">
            Note: the current Google Cloud pack in this repo uses category icons by default. To get service-specific icons, add the service icons and update the manifest mappings.
          </p>
        </Block>

        <Block title="Troubleshooting">
          <ul className="list-disc pl-6 text-sm text-slate-700 space-y-2">
            <li>
              If vendor icons don&apos;t show up, verify the manifest exists under{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/icon-packs/&lt;provider&gt;/manifest.json</code>{" "}
              and the <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">src</code> paths start with{" "}
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">/icon-packs/</code> (not <code className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px]">public/</code>).
            </li>
            <li>If an icon 404s, confirm the filename/casing matches exactly (Windows vs Linux can differ in production).</li>
            <li>If you changed a manifest and nothing updates, hard-refresh to bypass cached assets.</li>
          </ul>
        </Block>
      </section>
    </main>
  );
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border bg-white p-6 shadow-sm">
      <div className="text-sm font-extrabold text-slate-900">{title}</div>
      <div className="mt-3">{children}</div>
    </div>
  );
}

