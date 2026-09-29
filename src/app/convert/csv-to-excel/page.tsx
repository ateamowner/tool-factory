import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CsvToExcelConverter } from "@/components/tools/CsvToExcelConverter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/csv-to-excel";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "CSV to Excel Converter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a CSV to Excel converter?",
    answer:
      "A CSV to Excel converter turns comma-separated values into an .xlsx workbook you can open in Microsoft Excel, Google Sheets, Numbers, or LibreOffice. This page maps CSV rows to a spreadsheet in your browser, then lets you download the file.",
  },
  {
    question: "Does this CSV to Excel converter upload my data?",
    answer:
      "No. Pasted CSV and local .csv files are parsed in this tab. Nothing is sent to a server or stored on our side, and there is no account.",
  },
  {
    question: "What CSV formats can I convert to Excel?",
    answer:
      "Use standard comma-separated text with an optional header row. Quoted fields that contain commas, double quotes, or newlines are supported (RFC 4180-style). A UTF-8 BOM at the start of the file is stripped automatically.",
  },
  {
    question: "Why convert CSV to Excel (.xlsx)?",
    answer:
      "CSV is a plain-text export format. Excel workbooks keep column types, formatting, and a familiar spreadsheet UI for filters, pivots, and charts. Converting here gives you a downloadable .xlsx without installing desktop software or uploading to a third-party tool.",
  },
  {
    question: "Can I convert a local .csv file?",
    answer:
      "Yes. Choose a .csv file from your device. The file is read in the browser, converted the same way as pasted text, and never uploaded. Very large files may be slow in the tab — keep them under about two million characters.",
  },
  {
    question: "What if my CSV has commas or line breaks inside cells?",
    answer:
      "Wrap those cells in double quotes, and escape a quote inside a cell as two quotes (\"\"). The parser follows common spreadsheet CSV rules so quoted commas and newlines stay in one cell.",
  },
  {
    question: "Is the Excel file compatible with Google Sheets?",
    answer:
      "Yes. The download is a standard .xlsx (Office Open XML) workbook. Open it in Excel, upload it to Google Drive / Sheets, or use Numbers and LibreOffice Calc.",
  },
  {
    question: "How many rows and columns can I convert?",
    answer:
      "The tool is capped at about 50,000 data rows and 500 columns so the browser tab stays responsive. For larger exports, split the CSV or convert with a desktop tool.",
  },
];

export const metadata: Metadata = {
  title: "CSV to Excel Converter — Convert CSV to XLSX in Your Browser",
  description:
    "Free csv to excel converter. Paste CSV or open a .csv file to download an .xlsx spreadsheet in your browser. Quoted fields supported. No upload, no signup.",
  alternates: { canonical: href },
};

export default function CsvToExcelPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        CSV to Excel Converter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert CSV to Excel (.xlsx) in your browser. Paste comma-separated
        values or open a local .csv file — then download a spreadsheet. Files
        never leave the device.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">CSV → Excel</li>
        <li className="chip inline-flex">Client-side</li>
        <li className="chip inline-flex">.xlsx download</li>
      </ul>

      <div className="mt-8">
        <CsvToExcelConverter />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A CSV to Excel converter (also searched as csv to excel, convert csv
          to excel, or csv to xlsx) answers a practical question: how do I open
          a comma-separated export in Excel without fighting import wizards?
          Paste CSV here, or open a local .csv file, and download a real .xlsx
          workbook.
        </p>
        <p>
          The first row is treated as the header row for the preview column
          list. Quoted fields keep commas and newlines inside a single cell.
          Empty trailing columns on short rows are padded so the sheet stays
          rectangular.
        </p>
        <p>
          Everything stays on your device. There is no upload, no queue, and no
          account. The workbook is built in this tab with the same SheetJS
          library used elsewhere on Tool Factory for spreadsheet work.
        </p>
        <p>
          Need the other direction for API-shaped data? Use the{" "}
          <Link className="text-mint underline" href="/convert/json-to-csv">
            JSON to CSV converter
          </Link>
          . To turn a spreadsheet into a document, try the{" "}
          <Link className="text-mint underline" href="/convert/excel-to-pdf">
            Excel to PDF converter
          </Link>
          . For photos, open the{" "}
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
          hub. For campaign URLs, try the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the CSV to Excel converter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste CSV into the box, or choose a local .csv file.</li>
          <li>Confirm the column list and table preview look right.</li>
          <li>Download the .xlsx file for Excel, Google Sheets, or Numbers.</li>
          <li>If a cell should contain a comma, wrap it in double quotes in the CSV.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
