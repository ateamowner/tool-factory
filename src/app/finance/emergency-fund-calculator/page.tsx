import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { EmergencyFundCalculator } from "@/components/tools/EmergencyFundCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/emergency-fund-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Emergency Fund Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does an emergency fund calculator work?",
    answer:
      "An emergency fund calculator multiplies your monthly essential expenses by a target number of months — usually 3 to 12, with 6 as a common default. That product is the target fund. Subtract what you already have saved to see the gap, or a surplus if you are already over the target.",
  },
  {
    question: "How many months of expenses should I save?",
    answer:
      "Three months is a common starter target. Six months is the usual recommendation for a steadier cushion. Twelve months can make sense if income is irregular or a job search would take longer. This emergency fund calculator lets you pick any target from 3 to 12 months.",
  },
  {
    question: "What counts as monthly essential expenses?",
    answer:
      "Use costs you would still need in a job loss or emergency: housing, food, utilities, insurance, transport, and minimum debt payments. Skip discretionary spending you can pause. Enter one monthly total, or fill the optional line items and they add up for you.",
  },
  {
    question: "How do you calculate months to fully fund the emergency fund?",
    answer:
      "If you enter an optional monthly contribution, months to fully fund is the remaining gap divided by that contribution, rounded up to the next month. If the fund is already at or above the target, the result is 0. With no contribution, the page still shows the target and gap.",
  },
  {
    question: "What is the difference between a 3-month and 6-month emergency fund?",
    answer:
      "A 3-month fund is three times monthly essential expenses. A 6-month fund is twice that. The results panel always shows both targets and how much is left to reach each one, even when your chosen target is different.",
  },
  {
    question: "Does this emergency fund calculator upload my numbers?",
    answer:
      "No. Expenses, savings, and contributions are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
];

export const metadata: Metadata = {
  title: "Emergency Fund Calculator — Target Savings, Gap & Months to Fund",
  description:
    "Free emergency fund calculator for a 3–12 month cash cushion. Enter monthly essential expenses, current savings, and an optional contribution to see your target, gap, and months to fully fund. Runs in your browser.",
  alternates: { canonical: href },
};

export default function EmergencyFundCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Emergency Fund Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Size a 3–12 month cash cushion from monthly essential expenses, see the
        gap versus what you have saved, and estimate months to fully fund.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">3–12 month target</li>
        <li className="chip inline-flex">Gap vs savings</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <EmergencyFundCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An emergency fund calculator answers a practical question: how much
          cash should sit aside so a job loss, medical bill, or car repair does
          not become high-interest debt? Start with monthly essential expenses —
          housing, food, utilities, insurance, transport, and debt minimums —
          then multiply by the number of months you want covered.
        </p>
        <p>
          Six months is the default on this page because it is the most common
          advice. Three months is a solid first target. Nine or twelve months
          can fit irregular income. Enter current emergency savings to see the
          gap, and an optional monthly contribution to see how long full funding
          takes. The results also compare a 3-month fund with a 6-month fund
          side by side.
        </p>
        <p>
          Everything runs in your browser. Totals never leave the device, and
          there is no account. Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>{" "}
          and{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          . Need a photo converted locally? Try the{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the emergency fund calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter monthly essential expenses, or fill the optional line items.</li>
          <li>Choose a target of 3 to 12 months of expenses (default 6).</li>
          <li>Add current emergency savings if you already have a balance.</li>
          <li>Optionally enter a monthly contribution to see months to fully fund.</li>
          <li>Read the target, gap, and the 3-month vs 6-month comparison.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
