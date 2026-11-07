import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PayRaiseCalculator } from "@/components/tools/PayRaiseCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/pay-raise-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Pay Raise Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate a pay raise?",
    answer:
      "Multiply your current pay by the raise percent and add it on: new pay = old pay × (1 + raise ÷ 100). A 5% raise on $60,000 is $60,000 × 1.05 = $63,000, which is $3,000 more a year or $250 more a month.",
  },
  {
    question: "How do I find the percentage of a raise?",
    answer:
      "Subtract old pay from new pay, divide by old pay, and multiply by 100. Going from $50,000 to $54,000 is ($54,000 − $50,000) ÷ $50,000 × 100 = 8%. Use the Find raise % mode to do this both for hourly rates and salaries.",
  },
  {
    question: "How much is a $1 an hour raise per year?",
    answer:
      "At 40 hours a week and 52 weeks a year, $1 more per hour is $2,080 more per year before taxes, $40 more per week, and about $173.33 more per month. Change hours per week to match your schedule.",
  },
  {
    question: "What is a 3% raise on $20 an hour?",
    answer:
      "A 3% raise on $20 an hour is $0.60, so the new rate is $20.60. At 40 hours a week that is $24 more per week and $1,248 more per year, gross.",
  },
  {
    question: "Can I use this for an hourly wage and a salary?",
    answer:
      "Yes. Pick Hourly to enter an hourly rate or Salary to enter annual pay. The calculator converts using your hours per week and 52 weeks a year, then shows new pay per hour, week, month, and year plus the dollar difference.",
  },
  {
    question: "Is the raise shown before or after taxes?",
    answer:
      "Before taxes. Results are gross pay. Federal, state, and FICA taxes plus any retirement or benefit deductions will lower the take-home increase, so your paycheck will grow by less than the gross difference shown here.",
  },
  {
    question: "What is a typical pay raise?",
    answer:
      "Many employers budget annual merit raises in the low single digits, while promotions and job changes often bring larger jumps. Compare any raise to inflation: if prices rose more than your raise percent, your real buying power went down.",
  },
  {
    question: "Does this pay raise calculator upload my numbers?",
    answer:
      "No. Pay, raise, and hours are calculated in your browser. Nothing is sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Pay Raise Calculator — New Pay & Raise Percentage",
  description:
    "Free pay raise calculator. Enter a raise as a percent or dollar amount, or find the raise percent between old and new pay. Hourly or salary, with new pay per hour, week, month and year.",
  alternates: { canonical: href },
};

export default function PayRaiseCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Pay Raise Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        See what a raise is worth. Enter it as a percent or a dollar amount, or
        work backward from your old and new pay to get the raise percent. Works
        for hourly wages and salaries, and shows new pay per hour, week, month,
        and year with the dollar difference. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Percent or dollar raise</li>
        <li className="chip inline-flex">Reverse raise %</li>
        <li className="chip inline-flex">Hourly or salary</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <PayRaiseCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A raise percent applies to your current pay: new pay = old pay × (1 +
          raise ÷ 100). A 5% raise on $20 an hour is $21 an hour. At 40 hours a
          week and 52 weeks a year, that is $40 more per week and $2,080 more
          per year, before taxes.
        </p>
        <p>
          To find the percent between two numbers, divide the change by the old
          pay. Moving from $50,000 to $54,000 is a $4,000 raise, or 8%. The
          calculator shows the same breakdown for hourly and salaried pay so you
          can compare offers on equal terms.
        </p>
        <p>
          Results are gross estimates, not tax advice. Taxes and deductions
          shrink the take-home change. Everything runs in your browser. Numbers
          never leave the device, and there is no account.
        </p>
        <p>
          Turn the new rate into a paycheck with the{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          , or price extra hours with the{" "}
          <Link className="text-mint underline" href="/finance/overtime-calculator">
            overtime calculator
          </Link>
          . Check whether the raise beats inflation with the{" "}
          <Link className="text-mint underline" href="/finance/purchasing-power-calculator">
            purchasing power calculator
          </Link>
          . Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the pay raise calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose Raise by %, Raise by $, or Find raise %.</li>
          <li>Pick hourly or salary and enter your current pay.</li>
          <li>Enter the raise, or your new pay to find the percent.</li>
          <li>Set hours per week, then read new pay and the difference per hour, week, month, and year.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
