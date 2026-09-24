import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { BottleneckCalculator } from "@/components/tools/BottleneckCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/bottleneck-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Bottleneck Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a bottleneck calculator?",
    answer:
      "A bottleneck calculator finds the process step with the lowest capacity — the constraint that sets how much the whole system can finish. Enter each step’s name and how many units it can complete in one time period. This page marks the bottleneck, sets system throughput equal to that capacity, and shows utilization for every step. The math follows the Theory of Constraints: the slowest step limits the line.",
  },
  {
    question: "What is a bottleneck in the Theory of Constraints?",
    answer:
      "In the Theory of Constraints, a bottleneck is the resource that limits system throughput. Work piles up in front of it, and steps after it wait. Raising capacity on a non-constraint does not increase finished output until the constraint can handle more. This calculator treats capacity as units a step can finish in one period and picks the lowest capacity as that constraint.",
  },
  {
    question: "How does this calculator identify the bottleneck?",
    answer:
      "It compares the capacities you enter and selects the minimum. If two or more steps share that same lowest capacity, each of them is a bottleneck. Example: Mixing 120, Assembly 80, Inspection 100, and Packing 90 units per hour. Assembly at 80 is the bottleneck. The sample on this page uses those numbers.",
  },
  {
    question: "What is system throughput?",
    answer:
      "System throughput is the rate of finished units the whole process can sustain. On a single-path line it equals the bottleneck capacity, because faster steps cannot ship more than the slowest step releases. In the sample, throughput is 80 units per hour even though Mixing could do 120. Throughput here is a capacity rate, not revenue.",
  },
  {
    question: "How is utilization calculated for each step?",
    answer:
      "Utilization is throughput divided by that step’s capacity, shown as a percent. The bottleneck is at 100% because throughput equals its capacity. A step that can do 120 units while the line only finishes 80 is utilized at 80 ÷ 120 = 66.67%. Idle capacity is capacity minus throughput — slack you cannot turn into finished units until the constraint moves.",
  },
  {
    question: "How does a bottleneck calculator help with capacity planning?",
    answer:
      "Capacity planning asks where extra people, machines, or hours actually raise output. The utilization list shows which steps are already full and which have slack. Adding capacity on a 66% step does not raise throughput. Adding it on the 100% bottleneck does, until another step becomes the new lowest capacity. Re-enter the new capacities to see the next constraint.",
  },
  {
    question: "What if two steps have the same lowest capacity?",
    answer:
      "Both are bottlenecks, and system throughput equals that shared capacity. Each tied step is utilized at 100%. Faster steps still show utilization below 100%. If every step has the same capacity, the whole line is the constraint and every utilization is 100%. This model does not add changeover time, scrap, or variability.",
  },
  {
    question: "Does this bottleneck calculator upload my process data?",
    answer:
      "No. Step names, capacities, and the time-period label are calculated in your browser. Nothing is sent to a server or stored. Results are an educational capacity model for Theory of Constraints style planning, not a factory schedule or a financial forecast.",
  },
];

export const metadata: Metadata = {
  title: "Bottleneck Calculator — Throughput & Utilization",
  description:
    "Free bottleneck calculator. Add process steps and capacities to find the constraint, system throughput, and utilization % for Theory of Constraints capacity planning. Runs in your browser.",
  alternates: { canonical: href },
};

export default function BottleneckCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Bottleneck Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the process step that limits the line. Add each step’s capacity,
        see which one is the bottleneck, and read system throughput plus
        utilization for every step. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Lowest capacity</li>
        <li className="chip inline-flex">Throughput & utilization</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <BottleneckCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A bottleneck is the step that sets the pace of a process. In the
          Theory of Constraints, that constraint — not the average of every
          machine — decides how many units the system can finish in a period.
          This bottleneck calculator asks for a name and a capacity for each
          step. Capacity is units the step can complete per hour, per shift, or
          any period you name.
        </p>
        <p>
          The bottleneck is the lowest capacity. System throughput equals that
          number. A line that mixes 120 units an hour, assembles 80, inspects
          100, and packs 90 can only finish 80. Mixing’s extra 40 units an hour
          sit idle relative to the constraint. Utilization for each step is
          throughput divided by that step’s capacity: Assembly is 100%, Mixing
          is 66.67%, Inspection is 80%, and Packing is 88.89%.
        </p>
        <p>
          Use the list for capacity planning. Raise the bottleneck and the
          throughput number moves with it, until another step becomes the new
          lowest capacity. Two steps that share the minimum are both
          constraints. The model assumes one path and a steady rate. It does
          not price overtime, scrap, or changeovers.
        </p>
        <p>
          Results are an educational estimate, not a production schedule or
          financial advice. Step names and capacities stay in this browser.
          Nothing is uploaded, and there is no account.
        </p>
        <p>
          Pair the constraint with money math on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub: the{" "}
          <Link
            className="text-mint underline"
            href="/finance/break-even-sales-calculator"
          >
            break even sales calculator
          </Link>{" "}
          for the volume that covers fixed costs, the{" "}
          <Link className="text-mint underline" href="/finance/markup-calculator">
            markup calculator
          </Link>{" "}
          for price versus cost, the{" "}
          <Link
            className="text-mint underline"
            href="/finance/paycheck-calculator-hourly"
          >
            paycheck calculator hourly
          </Link>{" "}
          when extra hours include overtime, and the{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>{" "}
          for the period’s cash plan.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the bottleneck calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Name the time period (hour, shift, day) so every capacity uses the same unit.</li>
          <li>Add each process step with a name and a capacity greater than 0.</li>
          <li>Read the bottleneck — the lowest capacity — and system throughput, which matches it.</li>
          <li>Check utilization % for every step. 100% is the constraint; lower percents are slack.</li>
          <li>Edit a capacity and the constraint updates. Tied lows are all bottlenecks.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
