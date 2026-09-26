import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { OvertimeCalculator } from "@/components/tools/OvertimeCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/overtime-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Overtime Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does an overtime calculator work?",
    answer:
      "An overtime calculator multiplies regular hours by your hourly rate, then multiplies overtime hours by the same rate times an overtime multiplier (often 1.5). Regular pay + overtime pay equals total gross pay for the period. You can enter regular and OT hours separately, or enter total hours and a weekly threshold (commonly 40) so the page splits them for you.",
  },
  {
    question: "What is time and a half overtime?",
    answer:
      "Time and a half means overtime hours are paid at 1.5 times the regular hourly rate. Example: $20/hr with 40 regular hours and 5 OT hours is $800 regular + $150 OT = $950. Change the multiplier to 2 for double time when that applies to your situation.",
  },
  {
    question: "How do you calculate overtime after 40 hours a week?",
    answer:
      "Under a common weekly model, hours at or under the threshold (often 40) are paid at the regular rate, and hours above the threshold are paid at the overtime rate. In Total hours mode, enter 45 hours with a 40-hour threshold: 40 regular + 5 OT. Your employer or local rules may use a different threshold or daily overtime — adjust the inputs to match.",
  },
  {
    question: "What is the difference between regular rate and overtime rate?",
    answer:
      "The regular (straight-time) rate is your base hourly pay. The overtime rate is that base times the overtime multiplier. At 1.5×, a $22 hourly rate becomes a $33 OT rate. This page shows both so you can check the math before payday.",
  },
  {
    question: "How do weekly and biweekly overtime estimates differ?",
    answer:
      "This calculator estimates one week (or one entered period) of gross pay. The biweekly figure simply doubles that total, which is useful if two identical weeks make up a biweekly paycheck. Real biweekly totals can differ if hours change week to week, or if your plan uses a different overtime workweek.",
  },
  {
    question: "Does this overtime calculator include taxes?",
    answer:
      "No. Every total is gross pay before federal, state, FICA, retirement, or other deductions. Pair it with a paycheck tool if you need a broader gross-pay picture — still not a tax engine.",
  },
  {
    question: "Does this overtime calculator upload my pay data?",
    answer:
      "No. Hourly rate, hours, threshold, and multiplier are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this overtime calculator legal advice?",
    answer:
      "No. Results are an educational gross-pay estimate from the numbers you enter. Overtime eligibility, daily vs weekly OT, exemptions, and premiums vary by employer and jurisdiction. Check your handbook, payroll, or a qualified advisor for your situation.",
  },
];

export const metadata: Metadata = {
  title: "Overtime Calculator — Time & a Half Pay",
  description:
    "Free overtime calculator. Enter hourly rate, regular and OT hours (or total hours with a 40-hour threshold), and a 1.5× multiplier to see regular pay, overtime pay, and total gross. Runs in your browser.",
  alternates: { canonical: href },
};

export default function OvertimeCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Overtime Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate gross overtime pay from an hourly rate, regular hours, and
        overtime hours — or total hours with a weekly OT threshold. Default
        multiplier is 1.5 (time and a half). Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">1.5× default</li>
        <li className="chip inline-flex">40-hour threshold</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <OvertimeCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An overtime calculator answers a simple payroll question: if you work
          past a regular-hour threshold, what is that week worth before taxes?
          Enter your hourly rate, choose Total hours (with a threshold, often
          40) or Regular + OT hours, and set the multiplier (1.5 is the usual
          default).
        </p>
        <p>
          Regular pay = hourly rate × regular hours. Overtime pay = hourly rate
          × multiplier × OT hours. Example: $20/hr, 40 regular hours, and 5 OT
          hours at 1.5× is $800 + $150 = $950. The same 45 hours in Total hours
          mode with a 40-hour threshold produces the same split.
        </p>
        <p>
          Results are educational gross estimates, not legal or tax advice.
          Eligibility, daily overtime, and premiums can differ. Totals never
          leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link
            className="text-mint underline"
            href="/finance/paycheck-calculator-hourly"
          >
            paycheck calculator hourly
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/monthly-budget-template"
          >
            monthly budget template
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/emergency-fund-calculator"
          >
            emergency fund calculator
          </Link>
          ,{" "}
          <Link
            className="text-mint underline"
            href="/finance/credit-utilization-calculator"
          >
            credit utilization calculator
          </Link>
          , and{" "}
          <Link
            className="text-mint underline"
            href="/finance/break-even-sales-calculator"
          >
            break even sales calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the overtime calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter your regular hourly rate.</li>
          <li>
            Choose Total hours (plus OT threshold, often 40) or enter Regular +
            OT hours separately.
          </li>
          <li>Set the overtime multiplier (1.5 for time and a half, or 2 for double time).</li>
          <li>Read regular pay, overtime pay, OT rate, and total gross for the period.</li>
          <li>Optional: use the biweekly figure if two identical weeks make up your paycheck.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
