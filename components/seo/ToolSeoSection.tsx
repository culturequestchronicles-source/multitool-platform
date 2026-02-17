import Link from "next/link";
import JsonLd from "@/components/seo/JsonLd";
import { absUrl } from "@/lib/seo/site";
import { faqPageJsonLd, webApplicationJsonLd, type FaqItem } from "@/lib/seo/schema";
import type { RelatedLink, ToolSeoConfig } from "@/lib/seo/tools";

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h2 className="text-base font-black text-slate-900">{children}</h2>;
}

function Bullets({ items }: { items: string[] }) {
  return (
    <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-slate-700">
      {items.map((t) => (
        <li key={t}>{t}</li>
      ))}
    </ul>
  );
}

function Faq({ items }: { items: FaqItem[] }) {
  return (
    <div className="mt-6">
      <SectionTitle>FAQ</SectionTitle>
      <div className="mt-3 space-y-3">
        {items.map((i) => (
          <details key={i.question} className="rounded-2xl border bg-white p-4">
            <summary className="cursor-pointer text-sm font-extrabold text-slate-900">
              {i.question}
            </summary>
            <div className="mt-2 text-sm text-slate-700">{i.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}

function Related({ items }: { items: RelatedLink[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-6">
      <SectionTitle>Related Tools</SectionTitle>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-full border bg-white px-3 py-2 text-xs font-extrabold text-slate-800 hover:bg-slate-50"
          >
            {l.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ToolSeoSection({ tool }: { tool: ToolSeoConfig }) {
  const url = absUrl(tool.path);

  const webApp = webApplicationJsonLd({
    name: tool.title.replace(/\s+\|\s+Jhatpat$/, "").replace(/\s+—\s+Jhatpat$/, ""),
    description: tool.description,
    url,
    applicationCategory: tool.applicationCategory,
  });
  const faq = faqPageJsonLd({ url, items: tool.faqs });

  return (
    <section className="mx-auto max-w-5xl px-6 pb-16">
      <JsonLd id={`jsonld-webapp-${tool.path}`} value={webApp} />
      {tool.faqs.length ? <JsonLd id={`jsonld-faq-${tool.path}`} value={faq} /> : null}

      <div className="mt-10 rounded-3xl border bg-slate-50 p-6">
        <h2 className="text-lg font-black text-slate-900">About this tool</h2>
        <p className="mt-2 text-sm text-slate-700">{tool.description}</p>

        <div className="mt-6 grid gap-6 md:grid-cols-2">
          <div>
            <SectionTitle>What it does</SectionTitle>
            <Bullets items={tool.what} />
          </div>
          <div>
            <SectionTitle>How to use</SectionTitle>
            <Bullets items={tool.howTo} />
          </div>
        </div>

        {tool.notes?.length ? (
          <div className="mt-6">
            <SectionTitle>Notes</SectionTitle>
            <Bullets items={tool.notes} />
          </div>
        ) : null}

        <Faq items={tool.faqs} />
        <Related items={tool.related} />
      </div>
    </section>
  );
}

