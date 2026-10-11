import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ConcreteCalculator } from "@/components/tools/ConcreteCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/concrete-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Concrete Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a concrete calculator?",
    answer:
      "A concrete calculator estimates how much concrete you need for a slab, patio, driveway, footing, or round column. It returns the volume in cubic yards and cubic feet and the number of premix bags.",
  },
  {
    question: "How do I calculate cubic yards of concrete?",
    answer:
      "Multiply length in feet by width in feet by thickness in feet, then divide by 27. A 10 ft by 10 ft slab 4 inches thick is 10 × 10 × 0.333 = 33.3 cubic feet, or about 1.23 cubic yards.",
  },
  {
    question: "How many 80 lb bags of concrete do I need?",
    answer:
      "An 80 lb bag yields about 0.60 cubic feet. Divide the cubic feet by 0.60 and round up. A 10 ft by 10 ft by 4 in slab needs about 56 bags before waste, or 62 with 10% waste.",
  },
  {
    question: "How thick should a concrete slab be?",
    answer:
      "Four inches is common for patios, sidewalks, and shed floors. Driveways and garage floors are often 5 to 6 inches. Check local code and your contractor for loads and soil conditions.",
  },
  {
    question: "How much extra concrete should I order?",
    answer:
      "Most people add 5% to 10% for spillage, uneven grade, and form bulge. The calculator defaults to 10% waste, and you can change it to 0 to see the exact volume.",
  },
  {
    question: "How do I calculate concrete for a round column or post hole?",
    answer:
      "Volume is π × radius² × height. A 12 inch diameter hole 4 feet deep holds about 3.14 cubic feet, or 0.12 cubic yards. Enter the quantity to total several holes at once.",
  },
  {
    question: "Should I use bags or ready-mix?",
    answer:
      "Bags work well for small jobs under about one cubic yard. For larger slabs and driveways, ready-mix delivered by the cubic yard is usually easier and more consistent.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The concrete calculator runs entirely in your browser. Measurements are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Concrete Calculator — Cubic Yards, Slabs & Bags Needed",
  description:
    "Free concrete calculator. Estimate cubic yards and cubic feet for slabs, patios, footings, and round columns, with waste and 40, 60, and 80 lb bag counts. Runs in your browser.",
  alternates: { canonical: href },
};

export default function ConcreteCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Concrete Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate how much concrete you need for a slab, patio, footing, or
        round column. Get cubic yards, cubic feet, and 40, 60, and 80 lb bag
        counts with a waste allowance. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Cubic yards</li>
        <li className="chip inline-flex">Bags needed</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <ConcreteCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Concrete volume is length × width × thickness. Convert thickness
          from inches to feet, multiply, and divide cubic feet by 27 to get
          cubic yards. For round columns and post holes the calculator uses
          π × radius² × height.
        </p>
        <p>
          Example: a 10 ft × 10 ft patio poured 4 inches thick is 33.3 cubic
          feet, or 1.23 cubic yards. With 10% waste that is about 1.36 cubic
          yards, or 62 bags of 80 lb premix.
        </p>
        <p>
          Browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/home/roofing-calculator">
            roofing calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/home/house-sq-ft-estimator">
            house sq-ft estimator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/convert/cubic-yard-calculator">
            cubic yard calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the concrete calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a slab, patio, or footing, or a round column.</li>
          <li>Enter length, width, and thickness, or diameter and height.</li>
          <li>Set the quantity if you are pouring several identical pieces.</li>
          <li>Adjust the waste allowance (10% by default).</li>
          <li>Read cubic yards for ready-mix or the bag count for premix.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
