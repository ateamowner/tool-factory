import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { UuidGenerator } from "@/components/tools/UuidGenerator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/uuid-generator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "UUID Generator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a UUID generator?",
    answer:
      "A UUID generator creates 128-bit identifiers in the 8-4-4-4-12 hex format. This page is also an online GUID generator: GUID is the same identifier family under a Microsoft name.",
  },
  {
    question: "What is the difference between UUID v4 and UUID v7?",
    answer:
      "UUID v4 is random. UUID v7 embeds a Unix timestamp in milliseconds so IDs sort roughly by time, which helps database indexes. Both use Web Crypto for the random bits.",
  },
  {
    question: "Can this online GUID generator create many IDs at once?",
    answer:
      "Yes. Set How many (up to 1,000), generate, then copy one row or copy all. Bulk generation stays in the browser.",
  },
  {
    question: "Are generated UUIDs sent to a server?",
    answer:
      "No. IDs are created with the Web Crypto API in your browser. We do not log, store, or upload them.",
  },
  {
    question: "Is a UUID the same as a GUID?",
    answer:
      "For practical use, yes. A GUID is Microsoft’s name for the same 128-bit value. You can treat this UUID generator as an online GUID generator when a form asks for a GUID.",
  },
];

export const metadata: Metadata = {
  title: "UUID Generator — Free Online GUID Generator (v4 & v7)",
  description:
    "Free UUID generator and online GUID generator. Create UUID v4 or UUID v7 in bulk, then copy one or copy all. Uses Web Crypto in your browser.",
  alternates: { canonical: href },
};

export default function UuidGeneratorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        UUID Generator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Generate UUID v4 and UUID v7 locally — the same page works as an online GUID generator.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">UUID v4</li>
        <li className="chip inline-flex">UUID v7</li>
      </ul>

      <div className="mt-8">
        <UuidGenerator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          This UUID generator creates RFC 9562 identifiers in your browser. Use
          UUID v4 when you want a random id, or UUID v7 when you want
          time-ordered values that still look like standard UUIDs. The same
          output works as an online GUID generator whenever a form or API asks
          for a GUID.
        </p>
        <p>
          v4 fills 122 random bits and sets the version and variant nibbles. v7
          writes a 48-bit Unix timestamp in milliseconds, then random data, so
          newer IDs tend to sort after older ones. Both paths call Web Crypto
          (`crypto.getRandomValues`) — no third-party script, no network.
        </p>
        <p>
          Bulk generate up to 1,000 IDs, copy a single row, or copy all as a
          newline-separated list. Nothing is uploaded. Need to inspect a token?
          Open the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          . For campaign URLs, open the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          . For position math after several buys, use the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the UUID generator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose UUID v4 (random) or UUID v7 (time-ordered).</li>
          <li>Set how many IDs to create, from 1 to 1,000.</li>
          <li>Select Generate. Each row is a unique identifier.</li>
          <li>Copy one ID, or copy all for a list you can paste into a file or script.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
