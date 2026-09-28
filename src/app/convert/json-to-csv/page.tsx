import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { JsonToCsvConverter } from "@/components/tools/JsonToCsvConverter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/json-to-csv";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "JSON to CSV Converter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a JSON to CSV converter?",
    answer:
      "A JSON to CSV converter turns JSON data into comma-separated values you can open in Excel, Google Sheets, or any spreadsheet. This page maps objects to columns and rows in your browser, then lets you copy or download the CSV.",
  },
  {
    question: "Does this JSON to CSV converter upload my data?",
    answer:
      "No. Pasted JSON and local .json files are parsed in this tab. Nothing is sent to a server or stored on our side, and there is no account.",
  },
  {
    question: "What JSON shapes can I convert to CSV?",
    answer:
      "Use an array of objects (one row per object), a single object (one row), or an array of arrays. For arrays of arrays, if the first row is all strings it becomes the header row; otherwise columns are named column_1, column_2, and so on.",
  },
  {
    question: "How are nested objects and arrays handled?",
    answer:
      "Nested objects and arrays are stringified into a single cell with JSON text so the table stays flat. Escape rules follow common CSV practice: commas, quotes, and newlines inside a cell are wrapped in double quotes.",
  },
  {
    question: "Why convert JSON to CSV?",
    answer:
      "APIs and exports often return JSON, while reporting, filters, and pivot tables expect a spreadsheet. Converting here gives you a downloadable .csv without installing desktop software or pasting into a third-party upload tool.",
  },
  {
    question: "Can I convert a local .json file?",
    answer:
      "Yes. Choose a .json file from your device. The file is read in the browser, converted the same way as pasted text, and never uploaded. Very large files may be slow in the tab — keep them under about two million characters.",
  },
  {
    question: "What if my JSON is invalid?",
    answer:
      "If the text is not valid JSON, you get a clear parse error instead of a broken download. Trailing commas, single-quoted keys, and incomplete brackets are common causes — fix the JSON, then convert again.",
  },
  {
    question: "Is the CSV Excel-friendly?",
    answer:
      "Yes. The output uses a header row, comma separators, RFC 4180-style quoting, and a trailing newline. Open the file in Excel, Google Sheets, Numbers, or any tool that reads CSV.",
  },
];

export const metadata: Metadata = {
  title: "JSON to CSV Converter — Convert JSON in Your Browser",
  description:
    "Free json to csv converter. Paste JSON or open a .json file to download CSV in your browser. Arrays of objects, single objects, and arrays of arrays. No upload, no signup.",
  alternates: { canonical: href },
};

export default function JsonToCsvPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        JSON to CSV Converter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert JSON to CSV in your browser. Paste an array of objects, a single
        object, or an array of arrays — then copy or download. Files never leave
        the device.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">JSON → CSV</li>
        <li className="chip inline-flex">Client-side</li>
        <li className="chip inline-flex">Copy or download</li>
      </ul>

      <div className="mt-8">
        <JsonToCsvConverter />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A JSON to CSV converter (also searched as json to csv or convert json
          to csv) answers a practical question: how do I get API-shaped data into
          a spreadsheet without uploading it somewhere? Paste JSON here, or open
          a local .json file, and get comma-separated rows with a header line.
        </p>
        <p>
          Arrays of objects become one row per object, with columns from the
          union of keys in first-seen order. A single object is one row. Arrays
          of arrays use the first all-string row as headers when present.
          Nested values stay in one cell as JSON text so the sheet remains flat.
        </p>
        <p>
          Everything stays on your device. There is no upload, no queue, and no
          account. If the JSON will not parse, you get an error instead of a
          broken file.
        </p>
        <p>
          Need a spreadsheet turned into a document instead? Use the{" "}
          <Link className="text-mint underline" href="/convert/excel-to-pdf">
            Excel to PDF converter
          </Link>
          . For photos, try the{" "}
          <Link className="text-mint underline" href="/convert/png-to-jpg">
            PNG to JPG converter
          </Link>
          , the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          , or the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-pdf">
            HEIC to PDF converter
          </Link>
          . Browse more converters on the{" "}
          <Link className="text-mint underline" href="/convert">
            Convert
          </Link>{" "}
          hub. For pretty-printed queries, open the{" "}
          <Link className="text-mint underline" href="/dev/sql-formatter">
            SQL formatter
          </Link>
          . For tokens, use the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          . For campaign URLs, try the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the JSON to CSV converter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste JSON into the box, or choose a local .json file.</li>
          <li>Confirm the column list and CSV preview look right.</li>
          <li>Copy the CSV, or download a .csv file for Excel or Sheets.</li>
          <li>If JSON is invalid or the shape is not tabular, fix the error message and try again.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
