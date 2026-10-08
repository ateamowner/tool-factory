import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TipCalculator } from "@/components/tools/TipCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/tip-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Tip Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate a tip?",
    answer:
      "Multiply the bill by the tip percentage written as a decimal. For example, an 18% tip on a $50 bill is $50 × 0.18 = $9.00, so the total is $59.00. This calculator does the math for you and rounds the tip to the nearest cent.",
  },
  {
    question: "What is a quick way to figure 15%, 20%, or 25% in my head?",
    answer:
      "For 10%, move the decimal point one place left ($64.00 becomes $6.40). Double that for 20% ($12.80). Add half of the 10% amount for 15% ($6.40 + $3.20 = $9.60). For 25%, divide the bill by 4 ($16.00).",
  },
  {
    question: "How much should I tip?",
    answer:
      "Tipping customs vary by country, region, and type of service, and the amount is always your choice. In the United States, many people tip somewhere around 15% to 20% for table service, which is why this page offers 15, 18, 20, and 25% presets plus a custom field.",
  },
  {
    question: "Should I tip on the amount before or after tax?",
    answer:
      "Either is common. Tipping on the pre-tax subtotal is slightly smaller; tipping on the after-tax total is simpler because it is the number at the bottom of the check. Enter whichever amount you prefer as the bill amount.",
  },
  {
    question: "How do I split a bill and tip between several people?",
    answer:
      "Enter the number of people, and the calculator divides the total (bill plus tip) evenly. For example, a $120 bill with a 15% tip is $138.00, or $34.50 each for 4 people. When the total does not divide evenly, each share is rounded up to the next cent so the shares always cover the check.",
  },
  {
    question: "What does the round up option do?",
    answer:
      "Round total up raises the total to the next whole dollar and adds the difference to the tip. Round each share up does the same for every person's share, which is handy when everyone pays cash. The results show the effective tip percentage after rounding.",
  },
  {
    question: "Can I enter a custom tip percentage?",
    answer:
      "Yes. Choose Custom and type any percentage from 0 to 100, including decimals such as 22.5%. A 0% tip simply shows the bill split between the people you entered.",
  },
  {
    question: "Is my bill amount saved or uploaded?",
    answer:
      "No. The tip calculator runs entirely in your browser. Bill amounts, percentages, and party size are not sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Tip Calculator — Split the Bill & Tip Per Person",
  description:
    "Free tip calculator. Enter the bill, pick 15%, 18%, 20%, 25%, or a custom tip, and split it between any number of people. See the tip, total, and per-person amount, with optional round up. Runs in your browser.",
  alternates: { canonical: href },
};

export default function TipCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Tip Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Work out the tip and total for any bill. Pick a 15%, 18%, 20%, or 25%
        tip or enter your own, split the check between any number of people,
        and optionally round up to a whole dollar. Everything runs in the
        browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">15 / 18 / 20 / 25% presets</li>
        <li className="chip inline-flex">Split the bill</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <TipCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A tip calculator multiplies the bill by the tip percentage, adds it to
          the bill for the total, and divides by the number of people when you
          split the check. The tip is rounded to the nearest cent, and uneven
          shares are rounded up to the next cent so nobody comes up short.
        </p>
        <p>
          Example: a $86.40 dinner with a 20% tip is $17.28 in tip and $103.68
          total. Split three ways, that is $34.56 each. Choose Round each share
          up and everyone pays $35.00, for a $105.00 total and an effective tip
          of about 21.5%.
        </p>
        <p>
          How much to tip is a personal choice and customs differ by place and
          service. This page only does the arithmetic — amounts never leave the
          device.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/percent-off-calculator">
            percent off calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/discount-calculator">
            discount calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the tip calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the bill amount, before or after tax.</li>
          <li>Pick a 15%, 18%, 20%, or 25% tip, or choose Custom and type your own.</li>
          <li>Enter the number of people splitting the check (1 if you are paying alone).</li>
          <li>Optional: round the total or each person&apos;s share up to a whole dollar.</li>
          <li>Read the tip amount, total with tip, and per-person amounts.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
