import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About — Jhatpat",
  description: "Learn about Jhatpat, our mission, and our commitment to secure tools.",
};

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">About Jhatpat</h1>
      <p className="mt-3 text-sm text-gray-600">
        Jhatpat is a fast, privacy-first utility platform built for professionals and teams.
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
        </div>

        <div>
          <h2 className="text-lg font-semibold">Security & Trust</h2>
          <p className="mt-2">
            We prioritize data security, modern infrastructure, and clear privacy practices to
            protect your files and workflow.
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
