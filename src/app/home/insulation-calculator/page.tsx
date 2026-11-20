import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { InsulationCalculator } from "@/components/tools/InsulationCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/insulation-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Insulation Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How much insulation do I need?",
    answer:
      "Start with the R-value your climate zone calls for, subtract the R-value already in place, then cover the area at that thickness. For a 1,000 sq ft attic floor in climate zone 5 with nothing in it, the target is R-49. With blown-in cellulose at about R-3.6 per inch, that is about 13.6 inches deep and roughly 73 bags of 25 lb.",
  },
  {
    question: "What R-value do I need for my attic?",
    answer:
      "Typical recommendations run from about R-30 in warm southern zones to R-49 in the middle of the country and R-60 in the coldest zones. This calculator uses R-30 for zone 1, R-38 for zones 2 and 3, R-49 for zones 4 to 6, and R-60 for zones 7 and 8. Your local code may require more.",
  },
  {
    question: "What R-value do I need for walls?",
    answer:
      "Standard 2 × 4 walls are usually filled with R-13 batts in warm zones. Cooler zones call for R-20 or R-21, which fits 2 × 6 framing or a 2 × 4 wall with added exterior foam. This calculator uses R-13 for zones 1 and 2, R-20 for zones 3 to 5, and R-21 for zones 6 to 8.",
  },
  {
    question: "How do I find my climate zone?",
    answer:
      "Climate zones run from 1 in the hot South to 8 in the far north. They are set by county in the International Energy Conservation Code (IECC) and the U.S. Department of Energy map. Your local building department can confirm your zone and the minimum R-value it requires.",
  },
  {
    question: "Do I subtract existing insulation?",
    answer:
      "Yes, but only if it is dry and fluffy. Enter its R-value in the Existing R-value box and the calculator works out how much R you still need. Roughly R-3 per inch for old fiberglass and R-3.5 per inch for old cellulose is a fair estimate. Compressed, wet, or moldy insulation should be replaced, not counted.",
  },
  {
    question: "How many batts or rolls do I need?",
    answer:
      "Divide the area, plus waste, by the square feet in one batt or roll. A 23 in × 25 ft roll covers about 48 sq ft, and a 15 in × 93 in wall batt covers about 9.7 sq ft. The calculator rounds up to whole pieces and stacks layers when the R-value you need is more than the thickest standard batt, which is R-38.",
  },
  {
    question: "How many bags of blown-in insulation do I need?",
    answer:
      "Bags are figured from volume. Area times depth gives cubic feet, and installed density turns that into pounds. This calculator assumes about 1.6 lb per cu ft for cellulose in 25 lb bags and 0.8 lb per cu ft for fiberglass in 30 lb bags. Every brand prints its own coverage chart on the bag, so check it before you buy.",
  },
  {
    question: "How much extra should I buy for waste?",
    answer:
      "Plan on about 5% extra for open attics and 10% to 15% for walls and floors with lots of framing, wiring, and cut-offs. Blown-in insulation settles over time, so many installers also blow in a little deeper than the minimum.",
  },
  {
    question: "Is this different from the BTU calculator?",
    answer:
      "Yes. The BTU calculator sizes an air conditioner or heater for a room. This insulation calculator sizes the insulation that keeps the heat in or out. Better insulation lowers the BTUs a room needs, so use the square footage calculator for the area, then this tool for insulation, then the BTU calculator for the equipment.",
  },
];

export const metadata: Metadata = {
  title: "Insulation Calculator — R-Value, Batts, Rolls & Blown-In Bags",
  description:
    "Free insulation calculator. Enter square footage and climate zone to get the R-value target, then batts, rolls, or bags of blown-in insulation needed for attics, walls, and floors.",
  alternates: { canonical: href },
};

export default function InsulationCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Insulation Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Work out how much insulation you need for an attic, wall, or floor. Enter
        the square footage and your climate zone to see the recommended R-value,
        subtract what you already have, and get the number of batts, rolls, or
        bags of blown-in insulation. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">R-value by climate zone</li>
        <li className="chip inline-flex">Batts, rolls, blown-in</li>
        <li className="chip inline-flex">Existing insulation</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <InsulationCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Insulation is rated by R-value, its resistance to heat flow. A higher
          number means more resistance. The R-value you need depends on your
          climate zone and where the insulation goes: attics need the most, walls
          the least. Subtract the R-value already in place, then pick a product
          that delivers the rest.
        </p>
        <p>
          Example: a 1,000 sq ft attic floor in climate zone 5 with no insulation
          needs R-49. Blown-in cellulose at about R-3.6 per inch is about 13.6
          inches deep. That is about 1,134 cu ft, 1,815 lb, or 73 bags of 25 lb.
          With batts or rolls, R-49 is two layers of R-30 and R-19, or a stack
          of standard R-38 plus R-11.
        </p>
        <p>
          Need the area first? Measure it with the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>
          , which handles L-shaped rooms and feet and inches. Once the house is
          sealed up, size the heating and cooling with the{" "}
          <Link className="text-mint underline" href="/home/btu-calculator">
            BTU calculator
          </Link>
          . Finishing the walls after you insulate? The{" "}
          <Link className="text-mint underline" href="/home/drywall-calculator">
            drywall calculator
          </Link>{" "}
          turns room size into sheets and joint compound. Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning. R-value targets vary by local code,
          and bag coverage varies by brand, so check the package label and your
          building department before you buy.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the insulation calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the area to insulate in square feet.</li>
          <li>Pick your climate zone and whether it is an attic, cathedral ceiling, wall, or floor.</li>
          <li>Choose batts, rolls, blown-in cellulose, or blown-in fiberglass.</li>
          <li>Enter the R-value of any insulation already there, or leave it at 0.</li>
          <li>Leave the target blank to use the recommended R-value, or type your own.</li>
          <li>Add a waste percent and read the count, depth, and weight.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
