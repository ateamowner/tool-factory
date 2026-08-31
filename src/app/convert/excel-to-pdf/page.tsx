import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ExcelToPdfConverter } from "@/components/tools/ExcelToPdfConverter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/excel-to-pdf";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "Excel to PDF Converter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is an Excel to PDF converter?",
    answer:
      "An Excel to PDF converter turns .xlsx and .xls spreadsheets into a PDF you can open, print, or attach. This page does that conversion in your browser — one PDF per workbook, with a page sequence for each sheet.",
  },
  {
    question: "Does this Excel to PDF converter upload my spreadsheets?",
    answer:
      "No. Selected .xlsx and .xls files are parsed locally. Nothing is sent to a server or stored on our side, and there is no account.",
  },
  {
    question: "Why convert Excel to PDF?",
    answer:
      "A spreadsheet is easy to edit. PDF is what printers, forms, and most inboxes expect when you need a fixed layout. Converting here lets you share a table without asking the other person to open Excel.",
  },
  {
    question: "Can I convert more than one Excel file at a time?",
    answer:
      "Yes. Choose multiple .xlsx or .xls files, convert them in the browser, then download each PDF or download all. Keep batches to 20 files so the tab stays responsive.",
  },
  {
    question: "What if the file is not Excel or my browser cannot read it?",
    answer:
      "The tool checks the file signature. If the file is not .xlsx or .xls, you get a clear error. If the format matches but this browser cannot parse it, you get a read error instead of a broken download.",
  },
  {
    question: "How is the PDF built if nothing is uploaded?",
    answer:
      "The workbook is parsed in this tab, then each sheet is drawn as a table with a small local PDF builder. No third-party PDF service and no server encode step. Very large sheets are clipped to 2,000 rows and 24 columns so the tab stays usable.",
  },
];

export const metadata: Metadata = {
  title: "Excel to PDF Converter — Convert Spreadsheets in Your Browser",
  description:
    "Free excel to pdf converter. Convert .xlsx and .xls files to PDF in your browser. Batch convert and download locally. No upload, no signup.",
  alternates: { canonical: href },
};

export default function ExcelToPdfPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Excel to PDF Converter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert Excel spreadsheets to PDF in your browser. Files never leave the
        device — no upload, no account.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">.xlsx / .xls</li>
        <li className="chip inline-flex">Client-side</li>
        <li className="chip inline-flex">Batch download</li>
      </ul>

      <div className="mt-8">
        <ExcelToPdfConverter />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An Excel to PDF converter is for workbooks that need to travel as a
          document. Excel is for editing. PDF is what printers, forms, and most
          inboxes accept. This page is that converter: pick local .xlsx or .xls
          files, parse them here, and download a table PDF for each workbook.
        </p>
        <p>
          Everything stays on your device. There is no upload, no queue, and no
          account. If a file is not Excel, or this browser cannot read it, you
          get an error instead of a broken file. Batch convert up to 20 files
          when you have a handful of sheets to attach.
        </p>
        <p>
          Need a photo converted instead? Use the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>{" "}
          or the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-pdf">
            HEIC to PDF converter
          </Link>
          . Browse more converters on the{" "}
          <Link className="text-mint underline" href="/convert">
            Convert
          </Link>{" "}
          hub. For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          . For crawl rules, open the{" "}
          <Link className="text-mint underline" href="/seo/robots-txt-builder">
            robots.txt builder
          </Link>
          . For cost basis, try the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          . For gross pay, use the{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          . Need local identifiers? Use the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the Excel to PDF converter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose one or more .xlsx or .xls files from your device.</li>
          <li>Wait while this tab reads each workbook. Nothing is uploaded.</li>
          <li>Download a PDF for each success, or download all when you converted a batch.</li>
          <li>If a file is not Excel or will not parse, read the error on that row and try another file.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
