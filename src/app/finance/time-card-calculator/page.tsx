import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TimeCardCalculator } from "@/components/tools/TimeCardCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/time-card-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Time Card Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a time card calculator work?",
    answer:
      "For each day, a time card calculator subtracts the start time from the end time, then subtracts any unpaid break. It adds the days together for a weekly total in hours and minutes and in decimal hours. If you enter an hourly rate, it also multiplies regular and overtime hours by the right rate to estimate gross pay.",
  },
  {
    question: "How do I convert hours and minutes to decimal hours?",
    answer:
      "Divide the minutes by 60 and add the result to the hours. For example, 7 hours 45 minutes is 7 + 45 ÷ 60 = 7.75 hours, and 42:30 is 42.50 hours. Payroll usually multiplies decimal hours by the hourly rate, so this page shows both formats side by side.",
  },
  {
    question: "How are lunch breaks handled?",
    answer:
      "Enter unpaid break time in minutes for each day, and it is subtracted from that day's shift. An 8:00 AM to 4:30 PM shift with a 30-minute lunch is 8.00 hours. Leave the field blank or at 0 if your break is paid.",
  },
  {
    question: "Can I enter an overnight shift?",
    answer:
      "Yes. If the end time is earlier than the start time, the calculator treats it as a shift that crosses midnight. For example, 10:00 PM to 6:30 AM with a 30-minute break is 8.00 hours. Overnight days are marked with a ↻ next to the daily total.",
  },
  {
    question: "How is overtime calculated on a time card?",
    answer:
      "By default, weekly hours above 40 count as overtime and are paid at 1.5 times the hourly rate. Example: 42.5 hours at $20/hr is 40 × $20 = $800 regular plus 2.5 × $30 = $75 overtime, for $875 gross. You can change the threshold and multiplier if your employer uses a different rule.",
  },
  {
    question: "Do I need to enter an hourly rate?",
    answer:
      "No. Leave the hourly rate blank if you only want total hours worked. The hours, decimal hours, and regular versus overtime split still calculate; the pay rows simply stay empty.",
  },
  {
    question: "Does this time card calculator include taxes?",
    answer:
      "No. Pay figures are gross pay before federal, state, FICA, retirement, or other deductions. Use it to check hours and gross pay, not as a payroll or tax engine.",
  },
  {
    question: "Is my time card data saved or uploaded?",
    answer:
      "No. Start times, end times, breaks, and rates are calculated in your browser. Nothing is sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Time Card Calculator — Weekly Hours & Overtime",
  description:
    "Free time card calculator. Enter start and end times and unpaid breaks for each day to total weekly hours in h:mm and decimal, split overtime after 40 hours, and estimate gross pay. Runs in your browser.",
  alternates: { canonical: href },
};

export default function TimeCardCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Time Card Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Add up a week of clock-in and clock-out times. Enter start, end, and
        unpaid break minutes for each day to get total hours in h:mm and
        decimal, overtime after 40 hours, and optional gross pay. Everything
        runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Mon–Sun time sheet</li>
        <li className="chip inline-flex">Overnight shifts</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <TimeCardCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A time card calculator turns a week of punch times into the number
          payroll actually uses. For each day, worked time is the end time
          minus the start time, minus any unpaid break. The days add up to a
          weekly total, shown both as hours and minutes (42:30) and as decimal
          hours (42.50).
        </p>
        <p>
          Example: Monday through Friday, 7:00 AM to 4:00 PM with a 30-minute
          lunch, is 8.5 hours a day and 42.5 hours for the week. With a 40-hour
          overtime threshold and $20/hr, that is $800 regular pay plus 2.5
          overtime hours at $30/hr ($75), for $875 gross.
        </p>
        <p>
          Results are educational estimates, not payroll, tax, or legal advice.
          Overtime eligibility, daily overtime, and rounding rules differ by
          employer and jurisdiction. Times never leave the device.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/overtime-calculator">
            overtime calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the time card calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter a start and end time for each day you worked; leave other days blank.</li>
          <li>Add unpaid break minutes for each day (for example, 30 for lunch).</li>
          <li>Optional: enter your hourly rate to see gross pay.</li>
          <li>Adjust the overtime threshold (40 by default) and multiplier (1.5 by default) if needed.</li>
          <li>Read total hours in h:mm and decimal, the regular and overtime split, and gross pay.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
