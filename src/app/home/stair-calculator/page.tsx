import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { StairCalculator } from "@/components/tools/StairCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/stair-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Stair Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate the number of stairs I need?",
    answer:
      "Measure the total rise from finished floor to finished floor in inches, then divide by your maximum riser height and round up. For a 108 in rise and a 7.75 in max riser, 108 ÷ 7.75 = 13.9, so you need 14 risers. Divide the rise by that count to get the actual riser height: 108 ÷ 14 = 7.71 in.",
  },
  {
    question: "How many treads are there compared with risers?",
    answer:
      "A straight flight usually has one fewer tread than risers, because the upper floor acts as the last step. Fourteen risers means 13 treads.",
  },
  {
    question: "What is the typical maximum riser height and minimum tread depth?",
    answer:
      "Many US homes follow model-code values of about 7.75 in maximum riser height and 10 in minimum tread depth, not counting the nosing. These are typical figures, not your local code, so check with your building department before you build.",
  },
  {
    question: "How do I calculate the total run of a staircase?",
    answer:
      "Multiply the number of treads by the tread depth. Thirteen treads at 10 in each give a total run of 130 in, or 10 ft 10 in, measured horizontally from the first riser to the last.",
  },
  {
    question: "How long should a stair stringer be?",
    answer:
      "The stringer runs along the diagonal of the flight, so its length is the square root of total rise squared plus total run squared. A 108 in rise and 130 in run need a stringer about 169 in long, or 14 ft 1 in. Buy a board a little longer to allow for the top and bottom cuts.",
  },
  {
    question: "What is a comfortable stair angle?",
    answer:
      "Most residential stairs land between about 30 and 38 degrees. The angle is the arctangent of riser height divided by tread depth, so a 7.71 in riser and 10 in tread give about 37.6 degrees.",
  },
  {
    question: "What is the 2R + T stair rule?",
    answer:
      "A common comfort rule says two risers plus one tread should add up to about 24 to 25 in. A 7 in riser with an 11 in tread gives 25 in. This calculator shows the sum and flags it when it falls well outside that range.",
  },
  {
    question: "Does the tread depth include the nosing?",
    answer:
      "No. Tread depth here is the horizontal distance from one riser face to the next, without the nosing overhang. Nosings are usually 0.75 to 1.25 in and are added on top.",
  },
];

export const metadata: Metadata = {
  title: "Stair Calculator — Steps, Riser Height, Run & Stringer Length",
  description:
    "Free stair calculator. Enter total rise to get the number of steps, riser height, tread depth, total run, stringer length and stair angle, with typical code checks.",
  alternates: { canonical: href },
};

export default function StairCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Stair Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Plan a straight staircase from its total rise. Enter the floor-to-floor
        height, your maximum riser height and tread depth, and get the number of
        steps, exact riser height, total run, stringer length and stair angle.
        Results outside typical residential limits are flagged. Everything runs
        in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Steps and riser height</li>
        <li className="chip inline-flex">Run and stringer length</li>
        <li className="chip inline-flex">Typical limit checks</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <StairCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Every stair starts with the total rise: the vertical distance from the
          top of the lower finished floor to the top of the upper one. Divide it
          by the tallest riser you want and round up to get the number of risers,
          then divide the rise by that number so every step is the same height.
          A straight flight has one fewer tread than risers.
        </p>
        <p>
          Example: a 9 ft (108 in) floor-to-floor height with a 7.75 in max riser
          needs 14 risers of 7.71 in and 13 treads. At 10 in per tread the total
          run is 10 ft 10 in, the stringer is about 14 ft 1 in long, and the
          stair angle is about 37.6 degrees.
        </p>
        <p>
          Finishing the stairwell walls? The{" "}
          <Link className="text-mint underline" href="/home/drywall-calculator">
            drywall calculator
          </Link>{" "}
          counts sheets and joint compound, and the{" "}
          <Link className="text-mint underline" href="/home/tile-calculator">
            tile calculator
          </Link>{" "}
          works out tile for treads, risers or landings. Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          The 7.75 in riser and 10 in tread limits are typical residential
          values, not your local code. Confirm requirements for headroom,
          handrails and landings with your building department.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the stair calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Measure the total rise from finished floor to finished floor in inches.</li>
          <li>Enter the tallest riser you want. Leave 7.75 in if you are not sure.</li>
          <li>Enter the tread depth without the nosing. Leave 10 in if you are not sure.</li>
          <li>Read the number of steps, riser height, total run, stringer length and angle.</li>
          <li>Check any warnings, then confirm the numbers against your local code.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
