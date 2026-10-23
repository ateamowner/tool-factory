import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SodCalculator } from "@/components/tools/SodCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/sod-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Sod Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate how much sod I need?",
    answer:
      "Measure the lawn's length and width in feet and multiply them to get square feet. Add 5% to 10% for cutting and waste, then divide by the coverage of one roll or slab to get rolls, and by the coverage of one pallet to get pallets. Round both up. A 50 × 20 ft lawn is 1,000 sq ft, or 1,050 sq ft with 5% waste.",
  },
  {
    question: "How many square feet are in a roll of sod?",
    answer:
      "A standard sod roll or slab is 2 × 5 ft, which covers 10 square feet. Some farms cut 16 × 24 in slabs (about 2.67 sq ft), and big-roll sod used on large jobs can cover 300 sq ft or more per roll. Check your supplier's size and enter it in the calculator.",
  },
  {
    question: "How many square feet are in a pallet of sod?",
    answer:
      "Most pallets cover between 400 and 500 square feet, with 450 sq ft (45 rolls of 10 sq ft) being common. Some farms stack 500 or more. The calculator defaults to 450 sq ft per pallet; change it to match your sod farm.",
  },
  {
    question: "How much extra sod should I order?",
    answer:
      "Order about 5% extra for a simple rectangular lawn and 10% to 15% for curved beds, lots of edges, or obstacles like trees and walkways. Sod can't be stored for long, so avoid ordering much more than you will lay the same day.",
  },
  {
    question: "How many pallets of sod do I need for 1,000 square feet?",
    answer:
      "With 450 sq ft pallets, 1,000 sq ft needs about 2.2 pallets, so plan on 3 full pallets or 2 pallets plus about 100 sq ft of loose rolls. With 5% waste, that is 1,050 sq ft, or 105 rolls of 10 sq ft.",
  },
  {
    question: "How do I measure an irregular lawn for sod?",
    answer:
      "Break the lawn into rectangles, triangles, and circles, find each area, and add them up. The square footage calculator handles shapes and multiple areas; paste its total into this calculator's total square feet mode and add a slightly higher waste percent for curves.",
  },
  {
    question: "How much does a pallet of sod weigh?",
    answer:
      "A pallet of sod usually weighs about 2,000 to 3,000 lb, depending on grass type, soil, and moisture. That is more than most pickup trucks can safely carry, so many buyers pay for delivery.",
  },
  {
    question: "How is this different from the square footage calculator?",
    answer:
      "The square footage calculator measures the area of rooms and shapes. This sod calculator takes a lawn area, adds waste, and turns it into rolls, square yards, and pallets using the roll and pallet sizes you enter.",
  },
];

export const metadata: Metadata = {
  title: "Sod Calculator — Square Feet, Rolls & Pallets of Sod",
  description:
    "Free sod calculator. Enter lawn length and width or total square feet plus a waste percent to get square feet, rolls, and pallets of sod. Roll and pallet sizes are editable.",
  alternates: { canonical: href },
};

export default function SodCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Sod Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Figure out how much sod to order for a new lawn. Enter the length and
        width or the total square feet, add a waste percent, and get square
        feet, rolls, and pallets of sod. Roll and pallet sizes are editable to
        match your sod farm. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Square feet + yards</li>
        <li className="chip inline-flex">Rolls &amp; pallets</li>
        <li className="chip inline-flex">Editable sizes</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SodCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Sod is sold by the square foot, the roll, or the pallet, so the job is
          turning lawn area into whole units. Multiply length × width for the
          area, add a waste allowance, then divide by the coverage of one roll
          (usually 10 sq ft for a 2 × 5 ft roll) and one pallet (usually 400 to
          500 sq ft). Round up.
        </p>
        <p>
          Example: a 50 × 20 ft backyard is 1,000 sq ft. With 5% waste that is
          1,050 sq ft, or 105 rolls of 10 sq ft. At 450 sq ft per pallet, that
          is 2.33 pallets, so order 3 pallets or 2 pallets plus 15 rolls.
        </p>
        <p>
          Lawn shaped like an L or with curved beds? Measure each part with the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>{" "}
          and enter the total here. Pouring a patio or path next to the new
          lawn? Use the{" "}
          <Link className="text-mint underline" href="/home/concrete-calculator">
            concrete calculator
          </Link>
          , and for topsoil or mulch volume, the{" "}
          <Link className="text-mint underline" href="/convert/cubic-yard-calculator">
            cubic yard calculator
          </Link>
          . Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning. Roll and pallet sizes vary by sod
          farm and grass type; confirm with your supplier before ordering.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the sod calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick length × width or total square feet.</li>
          <li>Enter the lawn size in feet or square feet.</li>
          <li>Set a waste percent (5% for simple shapes, 10% or more for curves).</li>
          <li>Change the roll and pallet coverage if your supplier uses different sizes.</li>
          <li>Read the square feet, rolls, and pallets to order.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
