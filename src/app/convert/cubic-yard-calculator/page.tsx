import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CubicYardCalculator } from "@/components/tools/CubicYardCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/convert/cubic-yard-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Convert", href: "/convert" },
  { name: "Cubic Yard Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate cubic yards?",
    answer:
      "Convert length, width, and depth to feet, multiply them, then divide by 27. This cubic yard calculator does that for a rectangle, and it can also do a cylinder from diameter and depth. Example: a 10 ft × 10 ft bed at 3 inches deep is 10 × 10 × 0.25 = 25 cubic feet, or about 0.9259 cubic yards.",
  },
  {
    question: "What is the cubic yard formula?",
    answer:
      "Cubic yards = (length in feet × width in feet × depth in feet) / 27. One cubic yard is 27 cubic feet, so a 3 ft × 3 ft × 3 ft cube is exactly 1 cubic yard. The results panel shows cubic yards and cubic feet from the same dimensions.",
  },
  {
    question: "How do I convert inches to feet before calculating cubic yards?",
    answer:
      "Divide inches by 12 before multiplying. A 3 inch depth is 3 / 12 = 0.25 feet. Length and width work the same way, and each side can be feet or inches. Do not multiply raw inch measurements and then divide by 27 — that understates the volume.",
  },
  {
    question: "How many cubic feet are in a cubic yard?",
    answer:
      "There are 27 cubic feet in one cubic yard. If you already know cubic feet, divide by 27. If you know cubic yards, multiply by 27. This page lists both so you can compare a yard order with a cubic-foot bag count.",
  },
  {
    question: "Can I calculate a round column or circular bed?",
    answer:
      "Yes. Choose cylinder and enter diameter and depth in feet or inches. Cubic feet = π × radius² × depth, where radius is half the diameter after it is converted to feet. Cubic yards are that volume divided by 27. A 6 ft diameter column that is 1 ft deep is 9π cubic feet.",
  },
  {
    question: "How many bags of mulch, soil, or gravel do I need?",
    answer:
      "Enter the bag size in cubic feet, or leave it blank to skip bags. A common mulch or soil bag is 2 cubic feet. Bags needed are cubic feet divided by the bag size, rounded up. A 25 cubic foot bed is 13 bags at 2 cubic feet each. Gravel, sand, and concrete are often sold by the cubic yard — use the yard total for those orders. The count is a shopping estimate, not a delivery ticket.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "Length, width, diameter, and depth must be finite and 0 or more. Empty, infinite, and negative values are rejected. Commas in thousands (1,000) are accepted. Feet and inches can be mixed because each dimension has its own unit. A bag size, if you enter one, must be greater than 0 cubic feet.",
  },
  {
    question: "Is this cubic yard calculator a bid, survey, or engineering spec?",
    answer:
      "No. Results are an educational volume from the dimensions you type. They are not a contractor bid, a site survey, or an engineering specification. Compaction, waste, slope, and overage are not included. Confirm quantities with a supplier before you order mulch, gravel, concrete, soil, or sand.",
  },
];

export const metadata: Metadata = {
  title: "Cubic Yard Calculator — Mulch, Gravel & Concrete",
  description:
    "Free cubic yard calculator for mulch, gravel, concrete, soil, and sand. Convert length × width × depth in feet or inches to cubic yards and cubic feet. Runs in your browser.",
  alternates: { canonical: href },
};

export default function CubicYardCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Cubic Yard Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate cubic yards and cubic feet for mulch, gravel, concrete, soil,
        or sand. Enter length, width, and depth — or a cylinder — in feet or
        inches. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">÷ 27 cubic feet</li>
        <li className="chip inline-flex">Feet or inches</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CubicYardCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A cubic yard calculator answers a material question: how much mulch,
          gravel, concrete, soil, or sand fills a space you can measure. Enter
          a rectangle as length × width × depth, or switch to a cylinder and
          enter diameter × depth. Each side can be feet or inches.
        </p>
        <p>
          The formula is cubic yards = (length in feet × width in feet × depth
          in feet) / 27. Inches are converted first: divide by 12. Example: 10
          ft × 10 ft at 3 inches deep is 10 × 10 × 0.25 = 25 cubic feet, which
          is 25 / 27 ≈ 0.9259 cubic yards. A 3 ft × 3 ft × 3 ft cube is exactly
          1 cubic yard. For a circle, cubic feet = π × radius² × depth, then
          divide by 27.
        </p>
        <p>
          An optional bag size turns cubic feet into a bag count. Two cubic
          feet is a common mulch or soil bag, and partial bags round up. Clear
          the bag field if you only want yards and cubic feet. Results are an
          educational estimate, not a bid, survey, or engineering spec.
          Compaction, waste, and slope are not included. Everything runs in
          your browser. Totals never leave the device, and there is no account.
        </p>
        <p>
          Browse more converters on the{" "}
          <Link className="text-mint underline" href="/convert">
            Convert
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/convert/mm-to-inches-calculator">
            mm to inches calculator
          </Link>
          ,{" "}
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
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the cubic yard calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose rectangle (length × width × depth) or cylinder (diameter × depth).</li>
          <li>Enter each dimension and pick feet or inches. Depth can be inches or feet.</li>
          <li>Optionally enter a bag size in cubic feet. Two cubic feet is a common mulch bag.</li>
          <li>Read cubic yards and cubic feet. Bags round up when a bag size is set.</li>
          <li>Remember cubic yards = (length ft × width ft × depth ft) / 27. Inches are divided by 12 first.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
