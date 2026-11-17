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
          . To split rent for a partial month, use the{" "}
          <Link className="text-mint underline" href="/finance/prorated-rent-calculator">
            prorated rent calculator
          </Link>
          .
        </p>
      </section>


      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90" aria-labelledby="who-heading">
        <h2 id="who-heading" className="text-2xl font-semibold tracking-tight text-text">
          Who the date calculator is for
        </h2>
        <p>
          Use this page when you need a real calendar count, not a rough guess.
          Office managers use it to tally leave or a notice period. Landlords and
          tenants use it to measure a lease term or a move-out date. Project leads
          use it to count calendar days versus weekdays. Anyone adding a 30, 60, or
          90 day term to a start date can get the result date in Add or subtract
          mode. The dates stay in your browser.
        </p>
      </section>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90" aria-labelledby="example-heading">
        <h2 id="example-heading" className="text-2xl font-semibold tracking-tight text-text">
          Worked example
        </h2>
        <p>
          A rental starts on Friday, June 5, 2026 and ends on Thursday, August 13,
          2026. Leave Include end date off and the calculator counts 69 elapsed
          days, which is 2 months and 8 days, or 9 weeks and 6 days. Of those 69
          days, 49 are weekdays (Monday through Friday). Tick Include end date to
          count the last day as well: the stay is then 70 days, with 50 weekdays.
          That include-the-last-day count is the usual way to tally the nights plus
          the final day of a rental or a leave request.
        </p>
        <p>
          In Add or subtract mode, June 5, 2026 plus 2 months is Wednesday,
          August 5, 2026. The same start date plus 90 days can be entered as 90 in
          the days field; from Saturday, October 10, 2026, 90 days later is Friday,
          January 8, 2027.
        </p>
      </section>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90" aria-labelledby="edge-heading">
        <h2 id="edge-heading" className="text-2xl font-semibold tracking-tight text-text">
          Edge cases
        </h2>
        <p>
          Include end date adds one day to both the total and the weekday count.
          When you add or subtract months, a start date past the end of the target
          month moves to that month's last day: January 31, 2026 plus one month is
          February 28, 2026, and January 31, 2024 plus one month is February 29,
          2024 because 2024 is a leap year. Day counts use the real calendar, so
          leap days are included when they fall in the range.
        </p>
        <p>
          Weekdays are Monday through Friday only. Public holidays are not
          removed, so subtract any holidays that apply to you if you need an exact
          business-day count. The tool does not store dates or send them to a
          server.
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
