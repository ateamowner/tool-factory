import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PngToJpgConverter } from "@/components/tools/PngToJpgConverter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/png-to-jpg";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "PNG to JPG Converter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a PNG to JPG converter?",
    answer:
      "A PNG to JPG converter turns PNG images into JPEG files so they are smaller and easier to share in email, social posts, and apps that prefer JPG. This page does that conversion in your browser.",
  },
  {
    question: "Does this PNG to JPG converter upload my images?",
    answer:
      "No. Selected .png files are read locally with FileReader and drawn to a canvas in this tab. Nothing is sent to a server or stored on our side, and there is no account.",
  },
  {
    question: "Why convert PNG to JPG?",
    answer:
      "PNG is lossless and can include transparency, so screenshots and graphics stay sharp. JPG is smaller and widely accepted for photos. Converting here is a fast way to shrink a PNG for upload or email.",
  },
  {
    question: "Can I convert more than one PNG file at a time?",
    answer:
      "Yes. Choose multiple .png files, convert them in the browser, then download each JPG or download all. Keep batches to 20 files so the tab stays responsive.",
  },
  {
    question: "What happens to transparent PNGs?",
    answer:
      "JPG has no alpha channel. Transparent pixels are filled with white before encode so the download is a standard JPEG, not a broken file.",
  },
  {
    question: "What if the file is not PNG or my browser cannot decode it?",
    answer:
      "The tool checks the PNG file signature. If the file is not PNG, you get a clear error. If the format matches but this browser cannot decode it, you get a decode error instead of a broken download.",
  },
];

export const metadata: Metadata = {
  title: "PNG to JPG Converter — Convert PNG Images in Your Browser",
  description:
    "Free png to jpg converter. Convert PNG images to JPG in your browser. Batch convert and download locally. No upload, no signup.",
  alternates: { canonical: href },
};

export default function PngToJpgPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        PNG to JPG Converter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert PNG images to JPG in your browser. Files never leave the
        device — no upload, no account.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">.png</li>
        <li className="chip inline-flex">Client-side</li>
        <li className="chip inline-flex">Batch download</li>
      </ul>

      <div className="mt-8">
        <PngToJpgConverter />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A PNG to JPG converter is for images that need to be smaller or more
          widely accepted. PNG keeps every pixel and can include transparency.
          JPG is the format most cameras, inboxes, and social uploads expect.
          This page is that converter: pick local PNG files, encode them here,
          and download JPGs.
        </p>
        <p>
          Everything stays on your device. There is no upload, no queue, and no
          account. If a file is not PNG, or this browser cannot decode it, you
          get an error instead of a broken image. Batch convert up to 20 files
          when you have a handful of screenshots or exports to share.
        </p>
        <p>
          Need a HEIC photo as PNG? Use the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          . Need a printable photo? Use the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-pdf">
            HEIC to PDF converter
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
          How to use the PNG to JPG converter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose one or more .png files from your device.</li>
          <li>Wait while this tab reads each image with FileReader and encodes JPG. Nothing is uploaded.</li>
          <li>Download a JPG for each success, or download all when you converted a batch.</li>
          <li>If a file is not PNG or will not decode, read the error on that row and try another file.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
