import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ProratedRentCalculator } from "@/components/tools/ProratedRentCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/prorated-rent-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Prorated Rent Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is prorated rent?",
    answer:
      "Prorated rent is rent charged for only part of a month. It comes up when you move in after the 1st or move out before the end of the month. You pay a daily share of the monthly rent for each day you live there instead of the full amount.",
  },
  {
    question: "How do you calculate prorated rent?",
    answer:
      "Divide the monthly rent by the number of days in the month to get the daily rate, then multiply by the days you are charged. For $1,500 rent and a move-in on April 15 (30-day month), the daily rate is $50 and 16 days are charged, so prorated rent is $800.",
  },
  {
    question: "How do I prorate rent for a move-in?",
    answer:
      "Count from the move-in date through the last day of the month, including the move-in day. Moving in on October 21 in a 31-day month means 11 days. With $1,550 rent, the daily rate is $50, so the prorated rent is $550.",
  },
  {
    question: "How do I prorate rent for a move-out?",
    answer:
      "Count from the 1st of the month through the move-out date, including that day. Moving out on November 10 means 10 days. With $1,200 rent in a 30-day month, the daily rate is $40, so the prorated rent is $400.",
  },
  {
    question: "Should I use actual days in the month, a 30-day month, or 365 days a year?",
    answer:
      "Your lease decides. Many landlords divide by the actual days in that month. Some use a flat 30-day month, which makes the daily rate the same every month. Others use annual rent divided by 365 (monthly rent × 12 ÷ 365). The prorated rent calculator shows all three side by side so you can match your lease.",
  },
  {
    question: "Does the move-in day count as a day of rent?",
    answer:
      "Usually yes. Most leases charge for the day you get the keys and for the day you move out. This calculator counts both. If your lease starts or ends the charge a day earlier or later, adjust the date by one day.",
  },
  {
    question: "Why do the three methods give different answers?",
    answer:
      "Each one uses a different daily rate. In a 31-day month, rent ÷ 31 is smaller than rent ÷ 30, so the actual-days method charges less per day. The 365-day method uses 12 months of rent spread across the year, which usually lands slightly below the 30-day method. The differences are normally a few dollars.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The prorated rent calculator runs entirely in your browser. Rent amounts and dates are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Prorated Rent Calculator — Move-In & Move-Out",
  description:
    "Free prorated rent calculator. Find prorated rent for a move-in or move-out using actual days in the month, a 30-day month, or 365 days a year, with the daily rate shown. Runs in your browser.",
  alternates: { canonical: href },
};

export default function ProratedRentCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Prorated Rent Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Figure out prorated rent for a partial month. Enter the monthly rent and a move-in or
        move-out date, and see the daily rate and the amount owed by actual days in the
        month, a 30-day month, and 365 days a year. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Move-in and move-out</li>
        <li className="chip inline-flex">Daily rate shown</li>
        <li className="chip inline-flex">Three proration methods</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <ProratedRentCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">How prorated rent works</h2>
        <p>
          Prorated rent is the monthly rent multiplied by the share of the month you actually
          occupy the unit. First work out the daily rate, then multiply by the number of days
          charged. The only choice is how the daily rate is set.
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Actual days in the month: monthly rent ÷ 28, 29, 30, or 31.</li>
          <li>30-day month: monthly rent ÷ 30, the same rate every month.</li>
          <li>365 days a year: monthly rent × 12 ÷ 365.</li>
        </ul>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Example: prorated rent for a move-in</h2>
        <p>
          Rent is $1,550 and you move in on October 21. October has 31 days, so the daily rate
          is $50 and you are charged for 11 days (October 21 to 31). Prorated rent is $550.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Example: prorated rent for a move-out</h2>
        <p>
          Rent is $1,200 and you move out on November 10. November has 30 days, so the daily
          rate is $40 and you are charged for 10 days. Prorated rent is $400.
        </p>
        <p>
          Need to count the days between a lease start and end? Use the{" "}
          <Link className="text-mint underline" href="/finance/date-calculator">
            date calculator
          </Link>
          . To plan the rest of the month&apos;s costs, try the{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>{" "}
          or browse the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the prorated rent calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the full monthly rent.</li>
          <li>Choose move-in or move-out and pick the date.</li>
          <li>Read the prorated rent and daily rate for each method.</li>
          <li>Use the figure that matches the method in your lease.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
