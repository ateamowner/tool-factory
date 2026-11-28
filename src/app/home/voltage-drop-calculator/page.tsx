import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { VoltageDropCalculator } from "@/components/tools/VoltageDropCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/voltage-drop-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Voltage Drop Calculator", href },
];

const faqs: FaqItem[] = [
  {
    "question": "What is voltage drop?",
    "answer": "Voltage drop is the voltage lost along a wire because the conductor has resistance. The longer the run and the higher the current, the more voltage is lost before it reaches the load. The load sees the source voltage minus the drop."
  },
  {
    "question": "How do I calculate voltage drop?",
    "answer": "For single phase, volts dropped = 2 × resistance per 1,000 ft × one-way length in feet × amps ÷ 1,000. For three phase, replace the 2 with 1.732. Percent drop is volts dropped divided by source voltage times 100. Enter your numbers above and the calculator does it."
  },
  {
    "question": "What is the 3% voltage drop guideline?",
    "answer": "The NEC suggests, in informational notes, sizing branch circuits so voltage drop is about 3% or less, and feeders plus branch circuit together about 5% or less. These are recommendations for efficiency and performance, not enforceable rules in most cases. Check your local code and the equipment instructions."
  },
  {
    "question": "Where do the resistance values come from?",
    "answer": "The calculator uses the conductor resistance values in NEC Chapter 9, Table 8 (Conductor Properties): DC resistance at 75°C in ohms per 1,000 feet for stranded uncoated copper and for aluminum. Table 8 lists aluminum from 12 AWG up."
  },
  {
    "question": "Why is the length one-way?",
    "answer": "Current flows out on one conductor and back on the other, so a single phase circuit has twice the wire length in the loop. The formula already includes that factor of 2, so enter only the one-way distance from the source to the load."
  },
  {
    "question": "Is aluminum wire worse for voltage drop than copper?",
    "answer": "Aluminum has higher resistance than copper at the same AWG, roughly 1.6 times as much, so it drops more voltage. You usually go up one or two wire sizes to match copper. Aluminum also needs terminations rated for it."
  },
  {
    "question": "Does this include reactance or power factor?",
    "answer": "No. It uses DC resistance only, which is a good estimate for short runs and smaller wire. On large conductors, long AC runs, or low power factor loads, impedance matters and the real drop can be higher. Use the full NEC Table 9 method or an engineer for those."
  },
  {
    "question": "What does the smallest AWG under 3% mean?",
    "answer": "It is the smallest wire size in the list whose voltage drop stays at or under 3% for your length, current, voltage, and phase. It only checks voltage drop. Ampacity, temperature, conduit fill, and breaker size must also be checked, so confirm with the NEC and a licensed electrician."
  }
];

export const metadata: Metadata = {
  title: "Voltage Drop Calculator — Copper & Aluminum Wire, AWG, 3% Check",
  description:
    "Free voltage drop calculator. Enter wire material, AWG, length, amps, voltage, and phase to get volts dropped, percent drop, and the smallest AWG under 3%. Uses NEC Table 8.",
  alternates: { canonical: href },
};

export default function VoltageDropCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Voltage Drop Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Pick copper or aluminum wire, enter the AWG size, one-way length, amps,
        voltage, and single or three phase. See volts dropped, percent drop,
        voltage at the load, and the smallest wire size that stays under 3%.
        Everything runs in your browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Volts dropped</li>
        <li className="chip inline-flex">Percent drop</li>
        <li className="chip inline-flex">Voltage at load</li>
        <li className="chip inline-flex">Smallest AWG under 3%</li>
      </ul>

      <div className="mt-8">
        <VoltageDropCalculator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Every wire has resistance, so some voltage is lost between the source
          and the load. Too much drop makes motors run hot, lights dim, and
          electronics misbehave. A common planning target is 3% or less on a
          branch circuit, and about 5% or less for the feeder and branch circuit
          together. The NEC gives these as informational recommendations.
        </p>
        <p>
          This calculator uses conductor resistance from NEC Chapter 9, Table 8
          (Conductor Properties), in ohms per 1,000 feet at 75°C. Single phase
          drop is 2 × R × length × amps ÷ 1,000, and three phase drop is 1.732 ×
          R × length × amps ÷ 1,000. Example: 100 ft of 12 AWG copper carrying
          20 A at 120 V drops 7.92 V, or 6.6%, so 8 AWG is the smallest size
          under 3%.
        </p>
        <p>
          Results are estimates that use DC resistance and ignore reactance and
          power factor. They check voltage drop only, not ampacity, insulation,
          or conduit fill. Have a licensed electrician confirm any real wiring
          job.
        </p>
        <p>
          Sizing a cooling circuit? Start with the{" "}
          <Link className="text-mint underline" href="/home/btu-calculator">
            BTU calculator
          </Link>{" "}
          to find the unit size, then check the supply wire here. Need a wire or
          part dimension in inches? Use the{" "}
          <Link className="text-mint underline" href="/convert/mm-to-inches-calculator">
            mm to inches converter
          </Link>
          . You can also browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the voltage drop calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose copper or aluminum and the wire size in AWG.</li>
          <li>Enter the one-way length from source to load, in feet.</li>
          <li>Enter the current in amps and the source voltage.</li>
          <li>Choose single or three phase.</li>
          <li>Read the percent drop and the smallest AWG under 3%.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
