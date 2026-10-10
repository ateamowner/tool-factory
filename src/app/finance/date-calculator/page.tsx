import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { DateCalculator } from "@/components/tools/DateCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/date-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Date Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a date calculator?",
    answer:
      "A date calculator counts the number of days between two dates, or adds and subtracts days, weeks, months, and years from a date to find a new date. It also shows the difference in years, months, and days and the number of weekdays.",
  },
  {
    question: "How do I calculate the number of days between two dates?",
    answer:
      "Pick a start date and an end date. The calculator subtracts them and shows the total days. For example, January 1, 2026 to December 31, 2026 is 364 days, or 365 days if you include the end date.",
  },
  {
    question: "Does it include the end date?",
    answer:
      "By default the end date is not counted, which matches how most people count elapsed days. Tick “Include end date” to add one day, which is useful for counting days of a trip, a rental, or a leave period.",
  },
  {
    question: "How do I find a date 90 days from today?",
    answer:
      "Switch to Add or subtract, keep today as the start date, and enter 90 days. From October 10, 2026, 90 days later is Friday, January 8, 2027.",
  },
  {
    question: "What happens when I add a month to January 31?",
    answer:
      "When the target month is shorter, the result moves to the last day of that month. January 31, 2026 plus one month is February 28, 2026 (February 29 in a leap year).",
  },
  {
    question: "Does it account for leap years?",
    answer:
      "Yes. Day counts use the real calendar, so 2024 has 366 days and February 29 is handled correctly. Years, months, and days are also worked out from actual month lengths.",
  },
  {
    question: "How are weekdays counted?",
    answer:
      "Weekdays are Monday through Friday between the two dates. Public holidays are not removed, so subtract any holidays that apply to you for an exact business-day count.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The date calculator runs entirely in your browser. Dates are not sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Date Calculator — Days Between Dates & Add or Subtract Days",
  description:
    "Free date calculator. Count the days between two dates, or add and subtract days, weeks, months, and years from any date. Shows years, months, days, weeks, and weekdays. Runs in your browser.",
  alternates: { canonical: href },
};

export default function DateCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Date Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Count the days between two dates, or add and subtract days, weeks,
        months, and years to find a future or past date. See the gap in
        years, months, and days, total weeks, and weekdays. Everything runs in
        the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Days between dates</li>
        <li className="chip inline-flex">Add or subtract time</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <DateCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Use the date calculator for deadlines, due dates, contract terms,
          countdowns, and ages. The days-between mode subtracts two calendar
          dates; the add or subtract mode moves a date forward or back by any
          mix of years, months, weeks, and days.
        </p>
        <p>
          Example: March 15, 2020 to October 10, 2026 is 6 years, 6 months,
          and 25 days. Adding 90 days to October 10, 2026 lands on January 8,
          2027.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/time-card-calculator">
            time card calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/amortization-calculator">
            amortization calculator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/tip-calculator">
            tip calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the date calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose Days between dates or Add or subtract.</li>
          <li>Pick a start date.</li>
          <li>Pick an end date, or enter years, months, weeks, and days to add or subtract.</li>
          <li>Optional: include the end date in the count.</li>
          <li>Read the total days, the years-months-days breakdown, or the result date.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
