import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RoofPitchCalculator } from "@/components/tools/RoofPitchCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/roof-pitch-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Roof Pitch Calculator", href },
];

const faqs: FaqItem[] = [
  {
    "question": "What is roof pitch?",
    "answer": "Roof pitch is how steep a roof is, written as rise over run. A 6/12 pitch rises 6 inches for every 12 inches of horizontal run. In the US it is almost always stated per 12 inches of run."
  },
  {
    "question": "How do I calculate roof pitch?",
    "answer": "Measure the rise (vertical height) and the run (horizontal distance) in the same unit, then divide rise by run and multiply by 12. A rise of 4 over a run of 10 gives 4 / 10 × 12 = 4.8, so a 4.8/12 pitch. Enter both numbers above and the calculator does the math."
  },
  {
    "question": "How do I convert roof pitch to degrees?",
    "answer": "The angle is the arctangent of rise divided by run. A 6/12 roof is atan(0.5), which is about 26.57 degrees. A 12/12 roof is 45 degrees. The calculator shows the angle for any rise and run."
  },
  {
    "question": "What is the rafter multiplier?",
    "answer": "The rafter multiplier is the sloped length of the rafter for each 1 unit of horizontal run: the square root of 1 plus the slope squared. For a 6/12 roof it is about 1.118, so a 12 foot run needs a rafter about 13.4 feet long before overhang and cuts."
  },
  {
    "question": "How do I find roof pitch from the angle?",
    "answer": "Take the tangent of the angle and multiply by 12. A 30 degree roof is tan(30°) × 12, about 6.93/12. Use the angle converter in the calculator to do it."
  },
  {
    "question": "What is a low-slope roof?",
    "answer": "Roofs at or below 2/12 are usually called flat, and pitches under about 4/12 are considered low slope. Many shingle manufacturers have minimum pitch rules, so check the product instructions or local building code before choosing a roofing material."
  },
  {
    "question": "How do I measure roof pitch from the ground or attic?",
    "answer": "From the attic, hold a level 12 inches long against a rafter and measure straight down from the 12 inch mark to the rafter. That vertical measurement is the rise per 12. A pitch gauge, a digital level, or a phone angle app also works. Be careful on a roof and stay off wet or icy surfaces."
  },
  {
    "question": "Does roof pitch change the roof area?",
    "answer": "Yes. A steeper roof has more surface than the flat area under it. Multiply plan area by the rafter multiplier to get sloped surface area, then use the roofing calculator to turn that into squares and waste."
  }
];

export const metadata: Metadata = {
  title: "Roof Pitch Calculator — Pitch, Angle, Slope & Rafter Length",
  description:
    "Free roof pitch calculator. Enter rise and run to get pitch (x/12), angle in degrees, slope percent, and the rafter multiplier. Runs in your browser.",
  alternates: { canonical: href },
};

export default function RoofPitchCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Roof Pitch Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Enter the rise and run of a roof to get its pitch as x/12, the angle in
        degrees, the slope as a percent, and the rafter multiplier. Everything
        runs in your browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Pitch x/12</li>
        <li className="chip inline-flex">Angle in degrees</li>
        <li className="chip inline-flex">Slope percent</li>
        <li className="chip inline-flex">Rafter multiplier</li>
      </ul>

      <div className="mt-8">
        <RoofPitchCalculator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Roof pitch is the steepness of a roof: how many inches it rises for
          every 12 inches it runs horizontally. A 6/12 roof rises 6 inches per
          foot of run. Pitch decides which roofing materials are allowed, how
          you walk and work on the roof, and how much surface the roof has
          compared with the flat area under it.
        </p>
        <p>
          This calculator turns any rise and run into the numbers builders use.
          Pitch is rise divided by run, times 12. The angle is the arctangent of
          rise over run. Slope percent is rise over run times 100. The rafter
          multiplier is the square root of 1 plus the slope squared, and it
          gives the sloped rafter length for each unit of run.
        </p>
        <p>
          Once you know the pitch, size the job with the{" "}
          <Link className="text-mint underline" href="/home/roofing-calculator">
            roofing calculator
          </Link>{" "}
          for area, squares, and waste. Estimate the footprint with the{" "}
          <Link className="text-mint underline" href="/home/house-sq-ft-estimator">
            house sq-ft estimator
          </Link>{" "}
          or the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>
          , check{" "}
          <Link className="text-mint underline" href="/home/roof-algae-severity">
            roof algae severity
          </Link>
          , or browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub. Steep roofs are dangerous to work on, so leave them to a
          professional with fall protection.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the roof pitch calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Measure the rise and the run in the same unit.</li>
          <li>Enter them above, or tap a common pitch like 6/12.</li>
          <li>Read the pitch, angle, slope percent, and rafter multiplier.</li>
          <li>Use the angle box to convert degrees back to a pitch.</li>
          <li>Carry the multiplier into your roof area math.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
