import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { BtuCalculator } from "@/components/tools/BtuCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/btu-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "BTU Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How many BTUs do I need per square foot?",
    answer:
      "For cooling, a common rule of thumb is about 20 BTU per square foot with 8 ft ceilings. The ENERGY STAR chart this calculator uses rounds to unit sizes, so a 150 sq ft room needs about 5,000 BTU and a 500 sq ft room about 12,000 BTU. Heating usually needs 30 to 60 BTU per square foot depending on how cold your winters are.",
  },
  {
    question: "How do I calculate BTUs for a room?",
    answer:
      "Multiply the room's length by its width to get square feet, then look up the base BTU for that area. Adjust it: take off 10% for a heavily shaded room, add 10% for a very sunny one, add 600 BTU for each regular occupant past two, and add 4,000 BTU for a kitchen. Scale up for ceilings taller than 8 ft.",
  },
  {
    question: "What size air conditioner do I need for a 12 × 12 room?",
    answer:
      "A 12 × 12 ft room is 144 square feet, which the ENERGY STAR chart puts at 5,000 BTU with average sun, two people and an 8 ft ceiling. A sunny room or a taller ceiling can push it to a 6,000 BTU unit.",
  },
  {
    question: "How do ceiling height and sun change the BTU number?",
    answer:
      "Taller ceilings mean more air to cool, so this calculator multiplies by ceiling height ÷ 8 for anything over 8 ft. A 10 ft ceiling adds 25%. Strong afternoon sun adds about 10%, and a room that stays heavily shaded needs about 10% less.",
  },
  {
    question: "How many BTUs is a ton of air conditioning?",
    answer:
      "One ton of cooling is 12,000 BTU per hour. A 24,000 BTU unit is 2 tons and a 36,000 BTU unit is 3 tons. Central air systems are usually sold in half-ton steps from 1.5 to 5 tons.",
  },
  {
    question: "Is a bigger air conditioner better?",
    answer:
      "No. An oversized unit cools the air quickly and shuts off before it removes enough humidity, so the room feels clammy and the unit cycles more. An undersized unit runs nonstop on hot days. Pick the standard size closest to, but not below, your calculated BTUs.",
  },
  {
    question: "How many BTUs do I need to heat a room?",
    answer:
      "Heating depends mostly on climate and insulation. A rough guide is 30 BTU per square foot in warm areas, 40 in moderate areas, 50 in cool areas and 60 in cold areas. A 200 sq ft room in a moderate climate needs about 8,000 BTU of heat.",
  },
  {
    question: "Can I use this to size central air for a whole house?",
    answer:
      "Use it for a rough idea only. Whole-house systems should be sized with a Manual J load calculation, which looks at insulation, windows, duct leaks and your local design temperatures. An HVAC contractor can run one for you.",
  },
];

export const metadata: Metadata = {
  title: "BTU Calculator — Room AC & Heating Size by Square Feet",
  description:
    "Free BTU calculator. Enter room size and ceiling height, adjust for sun, people and a kitchen, and get cooling and heating BTUs plus a suggested AC unit size.",
  alternates: { canonical: href },
};

export default function BtuCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">BTU Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find how many BTUs it takes to cool or heat a room. Enter the room size
        and ceiling height, adjust for sun, people and a kitchen, and get cooling
        BTUs, tons, heating BTUs and a suggested standard air conditioner size.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Cooling and heating</li>
        <li className="chip inline-flex">ENERGY STAR chart</li>
        <li className="chip inline-flex">AC size suggestion</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <BtuCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A BTU (British thermal unit) is the heat needed to warm one pound of
          water by 1°F. Air conditioners and heaters are rated in BTU per hour.
          To size one, start from the room&apos;s floor area, then adjust for
          ceiling height, sun, how many people use the room and whether it is a
          kitchen.
        </p>
        <p>
          Examples: a 12 × 15 ft bedroom is 180 sq ft and needs about 6,000 BTU
          of cooling. The same room with a 10 ft ceiling and strong sun needs
          about 8,300 BTU, so a 10,000 BTU unit is the next standard size. A
          500 sq ft living room needs about 12,000 BTU, or one ton.
        </p>
        <p>
          Not sure of the room size? Measure it with the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>
          , which handles L-shaped rooms and feet and inches. Planning a remodel
          too? The{" "}
          <Link className="text-mint underline" href="/home/drywall-calculator">
            drywall calculator
          </Link>{" "}
          and{" "}
          <Link className="text-mint underline" href="/home/tile-calculator">
            tile calculator
          </Link>{" "}
          use the same room measurements. Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are rules of thumb for planning. For a whole-house system, ask
          an HVAC contractor for a Manual J load calculation.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the BTU calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the room length and width in feet, or switch to total square feet.</li>
          <li>Enter the ceiling height. Leave 8 ft if you are not sure.</li>
          <li>Pick how much sun the room gets.</li>
          <li>Enter how many people usually use the room, and tick the box if it is a kitchen.</li>
          <li>Pick your climate for the heating estimate.</li>
          <li>Read the cooling BTUs, tons, heating BTUs and the suggested AC size.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
