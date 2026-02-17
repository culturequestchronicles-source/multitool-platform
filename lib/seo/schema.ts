import { absUrl, SITE_NAME, SITE_URL } from "@/lib/seo/site";

export type FaqItem = { question: string; answer: string };

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function webApplicationJsonLd(opts: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: opts.name,
    description: opts.description,
    url: opts.url,
    applicationCategory: opts.applicationCategory,
    operatingSystem: "All",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };
}

export function faqPageJsonLd(opts: { url: string; items: FaqItem[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: opts.items.map((i) => ({
      "@type": "Question",
      name: i.question,
      acceptedAnswer: { "@type": "Answer", text: i.answer },
    })),
    url: opts.url,
  };
}

export function breadcrumbsJsonLd(opts: { items: Array<{ name: string; path: string }> }) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: opts.items.map((it, idx) => ({
      "@type": "ListItem",
      position: idx + 1,
      name: it.name,
      item: absUrl(it.path),
    })),
  };
}

