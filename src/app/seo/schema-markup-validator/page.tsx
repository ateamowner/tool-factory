import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SchemaMarkupValidator } from "@/components/tools/SchemaMarkupValidator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/seo/schema-markup-validator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "SEO", href: "/seo" },
  { name: "Schema Markup Validator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a schema markup validator?",
    answer:
      "A schema markup validator — also used as a schema checker — reads JSON-LD structured data and checks the shape: @context, @type, nested nodes, and common mistakes such as missing keys or invalid JSON. This page is one tool for both search terms.",
  },
  {
    question: "Is a schema checker different from a schema markup validator?",
    answer:
      "No. People search both names for the same job: paste markup and see whether the JSON-LD parses and looks like schema.org. There is no second page for “schema checker.”",
  },
  {
    question: "Does this validator call validator.schema.org?",
    answer:
      "No. Validation runs locally in your browser. The tool does not send markup to validator.schema.org, Google’s rich results test, or any other server. It checks JSON-LD structure, not live URL crawling or eligibility for rich results.",
  },
  {
    question: "What schema markup can I paste?",
    answer:
      "A JSON-LD object, a JSON array of nodes, an @graph document, or HTML that contains <script type=\"application/ld+json\"> blocks. The validator extracts those scripts, pretty-prints the JSON, and lists errors and warnings.",
  },
  {
    question: "Is my JSON-LD uploaded?",
    answer:
      "No. Paste, pretty-print, and copy stay in this tab. We do not log, store, or send schema markup.",
  },
];

export const metadata: Metadata = {
  title: "Schema Markup Validator — Free Schema Checker (JSON-LD)",
  description:
    "Free schema markup validator and schema checker. Paste JSON-LD to detect @context and @type, catch common errors, and pretty-print. Client-side only — nothing uploaded.",
  alternates: { canonical: href },
};

export default function SchemaMarkupValidatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Schema Markup Validator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Paste JSON-LD or a schema.org script block to validate structure —
        @context, @type, common errors, and a pretty-printed copy. The same
        page is the schema checker.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">JSON-LD</li>
        <li className="chip inline-flex">@context / @type</li>
        <li className="chip inline-flex">Pretty-print</li>
      </ul>

      <div className="mt-8">
        <SchemaMarkupValidator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A schema markup validator checks structured data before you ship it.
          Searchers also call this a schema checker. Paste JSON-LD and this
          page parses the document, walks nodes, and flags missing{" "}
          <code>@context</code>, missing <code>@type</code>, lookalike keys
          such as <code>type</code> instead of <code>@type</code>, and empty
          or invalid values.
        </p>
        <p>
          It also reads <code>&lt;script type=&quot;application/ld+json&quot;&gt;</code>{" "}
          blocks, <code>@graph</code> documents, and arrays of nodes. A
          pretty-print step formats valid JSON so you can copy a clean version
          back into a template. This is a local structure check, not a Google
          rich-results or validator.schema.org crawl.
        </p>
        <p>
          Everything runs in the browser. Pair it with the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>{" "}
          for campaign URLs and the{" "}
          <Link className="text-mint underline" href="/seo/robots-txt-builder">
            robots.txt builder
          </Link>{" "}
          for crawl rules. Inspect tokens with the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          . More SEO utilities live on the{" "}
          <Link className="text-mint underline" href="/seo">
            SEO
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the schema markup validator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste JSON-LD or an HTML snippet that contains a JSON-LD script tag.</li>
          <li>Scan detected @type values and any errors or warnings.</li>
          <li>Fix missing @context, @type, or renamed keys, then paste again.</li>
          <li>Use pretty-print and copy when the structure looks clean.</li>
          <li>Do not treat a clean structure check as proof of rich-result eligibility.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
