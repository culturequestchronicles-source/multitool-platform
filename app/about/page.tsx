import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About — Jhatpat",
  description: "Learn about Jhatpat, our mission, and our commitment to secure tools.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">About Jhatpat</h1>
      <p className="mt-3 text-sm text-gray-600">
        Jhatpat.com is a web utilities platform for quick file, data, and diagram workflows.
      </p>

      <section className="mt-8 space-y-5 text-sm text-gray-700">
        <div>
          <h2 className="text-lg font-semibold">Our Mission</h2>
          <p className="mt-2">
            We empower users with reliable, high-quality tools to handle everyday file and data
            workflows—securely, quickly, and without friction.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">What We Offer</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>PDF tools for merging, splitting, compression, and conversion.</li>
            <li>Data utilities for CSV, JSON, and Excel workflows.</li>
            <li>Diff tools, generators, and diagramming support for teams.</li>
          </ul>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link className="rounded-full border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50" href="/pdf-tools">
              PDF tools
            </Link>
            <Link className="rounded-full border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50" href="/csv-tools">
              CSV tools
            </Link>
            <Link className="rounded-full border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50" href="/diff-tools">
              Diff tools
            </Link>
            <Link className="rounded-full border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50" href="/diagramming">
              Diagramming
            </Link>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Security & Trust</h2>
          <p className="mt-2">
            Some tools run fully in your browser, and some tools use server APIs to process uploads.
            For sensitive documents or private data, avoid uploading and double-check the page notes
            before using a converter.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Brand Clarification</h2>
          <p className="mt-2">
            Jhatpat.com is not affiliated with any government utility portal or third-party service
            that may use a similar name. If you are looking for a connection or billing portal,
            verify you are on the correct official domain for that organization.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Get in Touch</h2>
          <p className="mt-2">
            We love feedback and feature ideas. Reach us at{" "}
            <a className="font-semibold text-blue-600" href="mailto:culturequestchronicles@gmail.com">
              culturequestchronicles@gmail.com
            </a>
            .
          </p>
        </div>
      </section>
    </main>
  );
}
