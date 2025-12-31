import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Feedback — Jhatpat",
  description: "Contact Jhatpat for support, feedback, or inquiries.",
};

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Contact & Feedback</h1>
      <p className="mt-3 text-sm text-gray-600">
        We’re here to help. Email us and we’ll respond as quickly as possible.
      </p>

      <section className="mt-8 rounded-2xl border bg-white p-6 text-sm text-gray-700 shadow-sm">
        <h2 className="text-lg font-semibold">Email</h2>
        <p className="mt-2">
          Send your questions, feedback, or support requests to:
        </p>
        <p className="mt-4">
          <a className="font-semibold text-blue-600" href="mailto:culturequestchronicles@gmail.com">
            culturequestchronicles@gmail.com
          </a>
        </p>
      </section>
    </main>
  );
}
