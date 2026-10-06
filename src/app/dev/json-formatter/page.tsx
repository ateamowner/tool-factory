import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { JsonFormatter } from "@/components/tools/JsonFormatter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/json-formatter";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "JSON Formatter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a JSON formatter?",
    answer:
      "A JSON formatter takes minified or messy JSON and pretty-prints it with line breaks and indentation so objects, arrays, and nested values are easy to read. This one also validates the JSON and runs entirely in your browser.",
  },
  {
    question: "Does this JSON formatter validate my JSON?",
    answer:
      "Yes. The input is parsed as strict JSON before it is formatted. If parsing fails, you see an Invalid JSON message with the parser error and, when the browser reports it, the line and column of the problem.",
  },
  {
    question: "Is my JSON uploaded to a server?",
    answer:
      "No. Parsing, formatting, copying, and downloading all happen in this tab. We do not log, store, or send what you paste, so it is safe for API responses and config files you would not post publicly.",
  },
  {
    question: "Can I choose 2 spaces, 4 spaces, or tabs?",
    answer:
      "Yes. Pick 2 spaces, 4 spaces, or Tab under Indent. Switch Output to Minify to collapse the JSON onto a single line with no extra whitespace.",
  },
  {
    question: "Can I sort JSON keys alphabetically?",
    answer:
      "Yes. Tick Sort keys A–Z to reorder object keys at every level. Array order is never changed, because array order is meaningful in JSON.",
  },
  {
    question: "Why does my JSON show as invalid?",
    answer:
      "Common causes are trailing commas, single quotes instead of double quotes, unquoted keys, comments, and values like undefined or NaN. Those are allowed in JavaScript but not in strict JSON. Fix the spot the error points to and the output updates as you type.",
  },
  {
    question: "Does formatting change my data?",
    answer:
      "No. Only whitespace changes, plus key order if you turn on sorting. Strings, numbers, booleans, and null keep the same values. Very large integers beyond about 9 quadrillion may lose precision, the same as in any JavaScript JSON parser.",
  },
  {
    question: "Can I copy or download the formatted JSON?",
    answer:
      "Yes. Use Copy to put the result on your clipboard, or Download .json to save it as formatted.json. Format replaces the input box with the formatted output, and Clear empties it.",
  },
];

export const metadata: Metadata = {
  title: "JSON Formatter — Free Online JSON Validator & Beautifier",
  description:
    "Free JSON formatter and validator. Paste JSON to pretty-print with 2 or 4 spaces or tabs, minify, sort keys, then copy or download. Runs in your browser.",
  alternates: { canonical: href },
};

export default function JsonFormatterPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        JSON Formatter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Paste JSON to validate and pretty-print it in your browser. Pick your
        indent, minify, or sort keys, then copy or download. Nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Validate</li>
        <li className="chip inline-flex">Pretty-print</li>
        <li className="chip inline-flex">Minify</li>
      </ul>

      <div className="mt-8">
        <JsonFormatter />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A JSON formatter turns a one-line API response or a hand-edited config
          into readable, indented JSON. Paste it here and every object and array
          gets its own level of indentation, so you can scan keys, spot missing
          values, and copy a clean version back into your editor.
        </p>
        <p>
          The formatter is also a JSON validator. Input is parsed as strict
          JSON, so trailing commas, single quotes, comments, and unquoted keys
          are flagged with the parser error and the line and column when your
          browser provides them. Valid input shows its top-level type, key
          count, nesting depth, and size in bytes.
        </p>
        <p>
          Everything stays in this tab, with no upload and no account. Need the
          data as a spreadsheet? Use the{" "}
          <Link className="text-mint underline" href="/convert/json-to-csv">
            JSON to CSV converter
          </Link>
          . To read a token payload, open the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          . Tidy a query with the{" "}
          <Link className="text-mint underline" href="/dev/sql-formatter">
            SQL formatter
          </Link>
          , make test IDs with the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          , or check JSON-LD with the{" "}
          <Link className="text-mint underline" href="/seo/schema-markup-validator">
            schema markup validator
          </Link>
          . More utilities live on the{" "}
          <Link className="text-mint underline" href="/dev">
            Developer
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the JSON formatter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste JSON into the box, or load the sample.</li>
          <li>Fix anything flagged as Invalid JSON at the reported line and column.</li>
          <li>Choose Pretty-print or Minify, your indent, and whether to sort keys.</li>
          <li>Copy the result or download it as a .json file.</li>
          <li>Clear the box when you are done. Nothing is stored.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
