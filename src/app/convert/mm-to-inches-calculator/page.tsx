import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { MmToInchesCalculator } from "@/components/tools/MmToInchesCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/mm-to-inches-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "Mm to Inches Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I convert millimeters to inches?",
    answer:
      "Divide millimeters by 25.4. The international inch is defined as exactly 25.4 mm, so 25.4 mm = 1 in, 12.7 mm = 0.5 in, and 10 mm ≈ 0.393701 in. This mm to inches calculator also shows a nearest 1/64 inch fraction.",
  },
  {
    question: "What is the exact mm to inches formula?",
    answer:
      "Inches = millimeters ÷ 25.4. Millimeters = inches × 25.4. There is no rounding in the SI definition of the inch — 1 inch is exactly 25.4 millimeters. Example: 50.8 mm ÷ 25.4 = 2 in.",
  },
  {
    question: "How many millimeters are in an inch?",
    answer:
      "There are exactly 25.4 millimeters in one inch. That is the international yard-and-pound definition used for science, manufacturing, and this converter. Older U.S. survey inches differed slightly and are not used here.",
  },
  {
    question: "Can I convert inches back to millimeters?",
    answer:
      "Yes. Switch to inches → mm and enter a decimal inch value. The page multiplies by 25.4. 1 in is 25.4 mm, 2 in is 50.8 mm, and 0.5 in is 12.7 mm. The same formula runs both directions in the browser.",
  },
  {
    question: "How do fractional inches work on this calculator?",
    answer:
      "After the decimal conversion, the page rounds to the nearest 1/64 inch and reduces the fraction. 12.7 mm is exactly 1/2 in. 10 mm is about 0.393701 in, shown as 25/64 in. Use the decimal result when you need more precision than a 1/64 step.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "Millimeters and inches must be finite and 0 or more. Empty, infinite, or negative values are rejected. Commas in thousands (1,000) are accepted. Results are a unit conversion only — they are not a calibrated measurement or an engineering spec.",
  },
  {
    question: "Does this mm to inches calculator upload my numbers?",
    answer:
      "No. Millimeters, inches, and the 25.4 formula are calculated in your browser. Nothing is sent to a server or stored on our side, and there is no account.",
  },
  {
    question: "Is this a measurement or engineering specification?",
    answer:
      "No. Results are an educational conversion from the numbers you enter using 1 inch = 25.4 mm. Shop drawings, tape-measure marks, and machining tolerances can differ. Check the drawing or a qualified spec before you cut or order material.",
  },
];

export const metadata: Metadata = {
  title: "Mm to Inches Calculator — Millimeters to Inches",
  description:
    "Free mm to inches calculator. Convert millimeters to inches (and inches back to mm) with the exact 1 inch = 25.4 mm formula. Shows decimal and fractional inches. Runs in your browser.",
  alternates: { canonical: href },
};

export default function MmToInchesCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Mm to Inches Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert millimeters to inches — and inches back to millimeters — with
        the exact 1 inch = 25.4 mm formula. See decimal inches plus a nearest
        1/64 inch fraction. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">1 in = 25.4 mm</li>
        <li className="chip inline-flex">mm ↔ inches</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <MmToInchesCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An mm to inches calculator answers a length question: if a part,
          drawing, or product is listed in millimeters, what is that size in
          inches? Enter millimeters to see decimal inches, or switch directions
          and enter inches to see millimeters. The same international inch is
          used both ways.
        </p>
        <p>
          The formula is inches = millimeters ÷ 25.4 and millimeters = inches ×
          25.4. Example: 25.4 mm is exactly 1 in. 12.7 mm is 0.5 in (1/2 in).
          10 mm is about 0.393701 in, shown as 25/64 in when rounded to the
          nearest sixty-fourth. Use the decimal result when a 1/64 step is not
          tight enough.
        </p>
        <p>
          Results are educational conversions, not a calibrated measurement or
          an engineering spec. Tape marks, shop drawings, and tolerances can
          differ. Everything runs in your browser. Totals never leave the
          device, and there is no account.
        </p>
        <p>
          Browse more converters on the{" "}
          <Link className="text-mint underline" href="/convert">
            Convert
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/convert/png-to-jpg">
            PNG to JPG converter
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/convert/excel-to-pdf">
            Excel to PDF converter
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/convert/heic-to-pdf">
            HEIC to PDF converter
          </Link>
          . For envelope square feet, use the{" "}
          <Link className="text-mint underline" href="/home/house-sq-ft-estimator">
            house sq-ft estimator
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the mm to inches calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose millimeters → inches (default) or inches → millimeters.</li>
          <li>Enter a length of 0 or more in the selected unit.</li>
          <li>Read the converted decimal value and the nearest 1/64 inch fraction.</li>
          <li>Remember 1 inch = 25.4 mm exactly — there is no extra rounding in the formula.</li>
          <li>Use the decimal inches when a sixty-fourth step is not precise enough.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
