import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { HeicToPdfConverter } from "@/components/tools/HeicToPdfConverter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/heic-to-pdf";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "HEIC to PDF Converter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a HEIC to PDF converter?",
    answer:
      "A HEIC to PDF converter turns Apple HEIC or HEIF photos into a PDF you can open, print, or attach. This page does that conversion in your browser — one PDF per photo.",
  },
  {
    question: "Does this HEIC to PDF converter upload my photos?",
    answer:
      "No. Selected .heic and .heif files are decoded locally. Nothing is sent to a server or stored on our side, and there is no account.",
  },
  {
    question: "Why convert HEIC to PDF?",
    answer:
      "iPhones often save HEIC. PDF is the format forms, printers, and email attachments expect. Converting here lets you send or print a photo without asking the other person to open HEIC.",
  },
  {
    question: "Can I convert more than one HEIC file at a time?",
    answer:
      "Yes. Choose multiple .heic or .heif files, convert them in the browser, then download each PDF or download all. Keep batches to 20 files so the tab stays responsive.",
  },
  {
    question: "What if the file is not HEIC or my browser cannot decode it?",
    answer:
      "The tool checks the file signature. If the file is not HEIC or HEIF, you get a clear error. If the format matches but this browser cannot decode it, you get a decode error instead of a broken download.",
  },
  {
    question: "How is the PDF built if nothing is uploaded?",
    answer:
      "The photo is decoded in this tab, written as a JPEG, then wrapped in a single-page PDF with a small local builder. No third-party PDF service and no server encode step.",
  },
];

export const metadata: Metadata = {
  title: "HEIC to PDF Converter — Convert HEIC Images in Your Browser",
  description:
    "Free HEIC to PDF converter. Convert .heic and .heif photos to PDF in your browser. Batch convert and download locally. No upload, no signup.",
  alternates: { canonical: href },
};

export default function HeicToPdfPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        HEIC to PDF Converter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert HEIC photos to PDF in your browser. Files never leave the
        device — no upload, no account.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">.heic / .heif</li>
        <li className="chip inline-flex">Client-side</li>
        <li className="chip inline-flex">Batch download</li>
      </ul>

      <div className="mt-8">
        <HeicToPdfConverter />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A HEIC to PDF converter is for iPhone photos that need to travel as a
          document. HEIC saves space on the phone. PDF is what printers, forms,
          and most inboxes accept. This page is that converter: pick local
          files, decode them here, and download a one-page PDF for each photo.
        </p>
        <p>
          Everything stays on your device. There is no upload, no queue, and no
          account. If a file is not HEIC or HEIF, or this browser cannot decode
          it, you get an error instead of a broken file. Batch convert up to 20
          files when you have a handful of shots to attach.
        </p>
        <p>
          Need a lossless image instead? Use the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          . Need PNG as JPG? Use the{" "}
          <Link className="text-mint underline" href="/convert/png-to-jpg">
            PNG to JPG converter
          </Link>
          . Need a spreadsheet as a document? Use the{" "}
          <Link className="text-mint underline" href="/convert/excel-to-pdf">
            Excel to PDF converter
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
          How to use the HEIC to PDF converter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose one or more .heic or .heif files from your device.</li>
          <li>Wait while this tab decodes each photo. Nothing is uploaded.</li>
          <li>Download a PDF for each success, or download all when you converted a batch.</li>
          <li>If a file is not HEIC or will not decode, read the error on that row and try another file.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
