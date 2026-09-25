import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RoofingCalculator } from "@/components/tools/RoofingCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { PITCH_PRESETS, formatFactor, pitchFactorFromRise } from "@/lib/roofing";
import { getSiteUrl } from "@/lib/site";

const href = "/home/roofing-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Roofing Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does this roofing calculator find roof surface area?",
    answer:
      "Start with the plan area: length × width in feet, or a plan area you type in square feet. Multiply that plan by a pitch factor. The factor is sqrt(1 + (rise / 12)²) for an X/12 pitch. A flat roof uses a factor of 1, so the surface equals the plan. Example: 40 ft × 30 ft is 1,200 sq ft of plan. A 6/12 pitch multiplies by about 1.1180, which is about 1,341.6 sq ft of roof surface.",
  },
  {
    question: "What is the roof pitch factor formula?",
    answer:
      "Pitch factor = √(1 + (rise / 12)²). The run is 12 in the usual X/12 notation. A 4/12 pitch is about 1.0541, 6/12 is about 1.1180, 8/12 is about 1.2019, and 12/12 is about 1.4142. You can also type a pitch factor directly from 1 to 3. Surface area ≈ plan area × pitch factor. This is the slope length of a simple plane, not a measured rafter with overhang.",
  },
  {
    question: "What is a roofing square?",
    answer:
      "One roofing square is 100 square feet of roof surface. Squares = surface square feet ÷ 100. A 1,200 sq ft flat roof is 12.00 squares. The same plan at 6/12 is about 13.42 squares before waste. Shingles and many other roofing materials are ordered in squares.",
  },
  {
    question: "How does waste percent change the square count?",
    answer:
      "Adjusted squares = squares × (1 + waste% / 100). The field starts at 10%, a common educational allowance for cuts. At 10% waste, 13.42 squares become about 14.76 squares. Enter 0 to use the net squares with no waste. Waste here is a percentage you choose. It does not measure hips, valleys, or starter courses.",
  },
  {
    question: "Can I enter plan area instead of length and width?",
    answer:
      "Yes. Switch from length × width to plan area and type the footprint in square feet. Pitch, waste, and an optional price still apply to that plan. Stories, wall height, and siding are not part of this calculator.",
  },
  {
    question: "What if I already know a pitch multiplier?",
    answer:
      "Choose pitch factor and type the multiplier. A factor of 1 leaves the surface equal to the plan. About 1.118 matches a 6/12 pitch. The factor must be from 1 to 3. If you know the rise instead, choose custom rise/12 and enter the rise only — the run stays 12.",
  },
  {
    question: "Does the price per square produce a contractor bid?",
    answer:
      "No. The price field starts blank, and this page does not fill in a contractor price. If you type a price per square, material cost = adjusted squares × that price. The result is an educational ballpark for materials only. Labor, tear-off, flashing, permits, and tax are not included.",
  },
  {
    question: "Is this roofing calculator a takeoff or an engineering spec?",
    answer:
      "No. Results are an educational estimate from the plan and pitch you type. They are not a roof takeoff, a bid, or an engineering specification. Dormers, hips, valleys, overhangs, and multiple planes are not measured. Confirm quantities with a roofer or supplier before you order materials.",
  },
];

export const metadata: Metadata = {
  title: "Roofing Calculator — Area, Squares & Waste",
  description:
    "Free roofing calculator for roof surface area, roofing squares, and waste. Enter length × width or plan area, an optional pitch or pitch factor, and an optional price per square. Runs in your browser.",
  alternates: { canonical: href },
};

export default function RoofingCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Roofing Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate roof surface area, roofing squares, and squares with waste.
        Enter length and width or a plan area, then an optional pitch. Price
        per square stays blank unless you type one. Everything runs in the
        browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Pitch factor</li>
        <li className="chip inline-flex">1 square = 100 sq ft</li>
        <li className="chip inline-flex">Educational only</li>
      </ul>

      <div className="mt-8">
        <RoofingCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A roofing calculator answers a materials question: about how many
          squares cover a simple roof you can measure. Enter the plan as length
          × width in feet, or type the plan area in square feet. Pitch is
          optional. Flat keeps the surface equal to the plan. A sloped roof is
          larger than the footprint because the surface runs up the slope.
        </p>
        <p>
          The formula is surface area ≈ plan area × √(1 + (rise / 12)²). One
          roofing square is 100 square feet, so squares = surface ÷ 100.
          Adjusted squares apply the waste percent you enter. The waste field
          starts at 10%. Example: 40 ft × 30 ft at 6/12 is 1,200 × √1.25 ≈
          1,341.6 sq ft, or about 13.42 squares before waste and about 14.76
          squares at 10% waste.
        </p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <caption className="mb-2 text-left text-base text-text">
              Pitch multiplier table
            </caption>
            <thead>
              <tr className="border-b border-line text-muted">
                <th className="py-2 pr-3 font-medium">Pitch</th>
                <th className="py-2 pr-3 font-medium">Factor</th>
                <th className="py-2 font-medium">Formula</th>
              </tr>
            </thead>
            <tbody>
              {PITCH_PRESETS.map((preset) => (
                <tr key={preset.id} className="border-b border-line/70">
                  <td className="py-2 pr-3">{preset.id === "flat" ? "Flat (0/12)" : preset.label}</td>
                  <td className="py-2 pr-3 font-mono tabular-nums">
                    {formatFactor(pitchFactorFromRise(preset.rise))}
                  </td>
                  <td className="py-2 font-mono text-xs sm:text-sm">
                    √(1 + ({preset.rise}/12)²)
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Price per square is optional and starts empty. This page does not
          invent a contractor price. If you enter one, material cost is
          adjusted squares times that price. Results are an educational
          estimate, not a bid, takeoff, or engineering spec. Hips, valleys,
          dormers, and overhangs are not included. Totals stay in your browser.
          Nothing is uploaded, and there is no account.
        </p>
        <p>
          Browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/home/house-sq-ft-estimator">
            house sq-ft estimator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/home/roof-algae-severity">
            roof algae severity quiz
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/home/soft-wash-mix-calculator">
            soft wash mix calculator
          </Link>
          . For bulk material volume, use the{" "}
          <Link className="text-mint underline" href="/convert/cubic-yard-calculator">
            cubic yard calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the roofing calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter length and width in feet, or switch to a plan area in square feet.</li>
          <li>Pick a common pitch (flat, 4/12, 6/12, 8/12, or 12/12), a custom rise/12, or a pitch factor.</li>
          <li>Leave waste at 10%, or type another percent from 0 to 100.</li>
          <li>Leave price per square blank, or type your own price if you want a material cost.</li>
          <li>Read roof surface area, squares, and adjusted squares. Cost appears only after a price is entered.</li>
          <li>Remember surface ≈ plan × √(1 + (rise / 12)²), and 1 square = 100 sq ft.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
