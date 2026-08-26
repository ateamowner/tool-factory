import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { UtmBuilder } from "@/components/tools/UtmBuilder";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/seo/utm-builder";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "SEO", href: "/seo" },
  { name: "UTM Builder", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a UTM builder?",
    answer:
      "A UTM builder — also called a UTM generator, UTM maker, or UTM link builder — adds campaign parameters to a destination URL so analytics can attribute traffic. This page is one tool that covers all of those jobs.",
  },
  {
    question: "Which UTM parameters does this UTM generator support?",
    answer:
      "Destination URL plus utm_source, utm_medium, utm_campaign, optional utm_term, utm_content, and utm_id. Presets fill source and medium for Meta ads, Google ads, and email.",
  },
  {
    question: "What naming rules does the UTM maker apply?",
    answer:
      "With naming rules on, values are lowercased and spaces become underscores. That keeps reports from splitting Summer Sale and summer_sale into two rows.",
  },
  {
    question: "Can I build UTM links in bulk from CSV?",
    answer:
      "Yes. Paste rows or upload a CSV, preview the final URLs, then export a CSV with a final_url column. Parsing and export happen in the browser.",
  },
  {
    question: "Does this UTM link builder send my URLs to a server?",
    answer:
      "No. Destination URLs, parameters, pasted CSV, and uploaded files are processed locally. Nothing is uploaded for storage or tracking.",
  },
];

export const metadata: Metadata = {
  title: "UTM Builder — Free UTM Generator, Maker & Link Builder",
  description:
    "Free UTM builder, UTM generator, and UTM link maker. Add source, medium, campaign, optional fields, presets, and bulk CSV. Copy the final URL. Client-side only.",
  alternates: { canonical: href },
};

export default function UtmBuilderPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        UTM Builder
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        One UTM generator, UTM maker, and UTM link builder for campaign URLs — including bulk CSV.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip">Meta ads</li>
        <li className="chip">Google ads</li>
        <li className="chip">Email</li>
      </ul>

      <div className="mt-8">
        <UtmBuilder />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A UTM builder appends campaign tags to a landing page so analytics
          tools can credit the click. This page is the UTM generator and UTM
          maker for Tool Factory: one URL, not a cluster of thin copies for
          “utm generator” or “utm link builder.” Use it for ads, email, and
          social without pasting parameters by hand.
        </p>
        <p>
          Fill destination, utm_source, utm_medium, and utm_campaign. Add
          utm_term, utm_content, or utm_id when you need keyword, creative, or
          campaign ID detail. Presets for Meta ads, Google ads, and email set
          source and medium so you only name the campaign. Naming rules
          lowercase values and turn spaces into underscores so reports stay
          tidy.
        </p>
        <p>
          For batches, paste or upload CSV rows and export a file with
          final_url. Every step is client-side: the file never leaves the
          browser. Copy the finished URL when you are ready to ship a link.
        </p>
        <p>
          Tracking a finance landing page? Open the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          . Need a unique id for a test campaign? Use the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the UTM builder
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the destination URL (https is added if you omit the protocol).</li>
          <li>Fill source, medium, and campaign, or apply a Meta, Google, or email preset.</li>
          <li>Optionally add term, content, and utm_id. Keep naming rules on unless you need exact casing.</li>
          <li>Copy the final URL, or paste/upload CSV rows and export the generated links.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
