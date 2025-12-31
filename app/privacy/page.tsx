import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — Jhatpat",
  description: "Learn how Jhatpat handles data, privacy, and security.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-semibold">Privacy Policy</h1>
      <p className="mt-3 text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>

      <section className="mt-8 space-y-4 text-sm text-gray-700">
        <p>
          Jhatpat is built to keep your data safe and your workflows fast. This policy explains
          what we collect, how we use it, and the choices you have.
        </p>

        <div>
          <h2 className="text-lg font-semibold">Information We Collect</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>
              <strong>Uploaded files:</strong> Files you upload to run a tool. These are processed
              and discarded per tool workflow unless otherwise stated.
            </li>
            <li>
              <strong>Usage data:</strong> Basic analytics (page views, tool usage) to improve
              performance and reliability.
            </li>
            <li>
              <strong>Account data:</strong> If you sign in, we store your email and identifiers
              from the authentication provider.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">How We Use Information</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Deliver tool results (conversions, exports, reports).</li>
            <li>Maintain security, prevent abuse, and monitor system health.</li>
            <li>Improve product quality and user experience.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Data Retention</h2>
          <p className="mt-2">
            We retain data only as long as needed to provide the service. Generated outputs are
            ephemeral and should be downloaded promptly.
          </p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Your Choices</h2>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Use tools without creating an account whenever possible.</li>
            <li>Contact us to request data deletion or corrections.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Contact</h2>
          <p className="mt-2">
            Questions about privacy? Email{" "}
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
