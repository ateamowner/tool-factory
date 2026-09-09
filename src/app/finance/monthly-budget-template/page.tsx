import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { MonthlyBudgetTemplate } from "@/components/tools/MonthlyBudgetTemplate";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/monthly-budget-template";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Monthly Budget Template", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a monthly budget template work?",
    answer:
      "A monthly budget template lists every income line and expense category for one month, then subtracts total expenses from total income. The leftover is a surplus you can save or spend, or a deficit you need to cover. This page starts with sample rows so you can replace the numbers with your own.",
  },
  {
    question: "What is zero-based budgeting?",
    answer:
      "Zero-based budgeting assigns every dollar of monthly income to a job — bills, debt, savings, or spending — until remaining is $0. The point is not to spend everything; it is to decide where leftover money goes before the month starts. If this template shows a surplus, add a savings or extra-debt line until the remainder is zero.",
  },
  {
    question: "What is the 50/30/20 budget rule?",
    answer:
      "50/30/20 is a simple split of after-tax income: about 50% for needs (housing, utilities, food, transport, debt minimums), 30% for wants, and 20% for savings or extra debt. It is a starting guide, not a requirement. This monthly budget template lets you see your actual mix by category, then adjust the lines.",
  },
  {
    question: "How should I track monthly expenses?",
    answer:
      "Start with last month’s bank and card statements, then group spending into housing, utilities, food, transport, debt, savings, and other. Use one row per bill or habit you want to watch. Update amounts when a bill changes. The template totals as you type so you can see which categories are driving the month.",
  },
  {
    question: "What is a budget surplus vs a deficit?",
    answer:
      "A surplus means income is higher than planned expenses — remaining is positive. A deficit means expenses are higher than income — remaining is negative and you will need to cut spending, raise income, or use savings. A balanced month is when remaining is $0, which is the goal of zero-based budgeting.",
  },
  {
    question: "Does this monthly budget template upload my numbers?",
    answer:
      "No. Income, expenses, and totals are calculated in your browser. Nothing is sent to a server or stored on our side. You can copy or print a summary from this device; we never see the figures.",
  },
  {
    question: "How is the savings rate calculated?",
    answer:
      "Savings rate is the sum of lines in the Savings category divided by total income, then shown as a percent. If income is $4,600 and you plan $400 of savings, the rate is about 8.7%. A $0 savings plan still shows 0% when income is above zero. If income is blank or $0, the rate is omitted. This is an educational estimate, not financial advice.",
  },
];

export const metadata: Metadata = {
  title: "Monthly Budget Template — Income, Expenses & Remaining Balance",
  description:
    "Free monthly budget template. Add income and expense lines, then see total income, total expenses, surplus or deficit, and savings rate. Runs in your browser — nothing is uploaded.",
  alternates: { canonical: href },
};

export default function MonthlyBudgetTemplatePage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Monthly Budget Template
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Plan one month of income and expenses by category. See the leftover
        surplus or deficit, plus an optional savings rate. Sample rows are
        included so you can start immediately.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Income + expenses</li>
        <li className="chip inline-flex">Surplus or deficit</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <MonthlyBudgetTemplate />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A monthly budget template answers a practical question: after this
          month’s income and planned spending, how much is left? Enter paychecks
          and other income, then add expense lines for housing, utilities, food,
          transport, debt, savings, and other. Totals update in the browser.
        </p>
        <p>
          Remaining is income minus every expense line, including savings you
          already planned. A positive leftover is a surplus you can assign — a
          zero-based budget would give that leftover a job. A negative leftover
          is a deficit. The optional savings rate is savings-category dollars
          divided by total income. Results are educational estimates only, not
          financial advice.
        </p>
        <p>
          Everything runs in your browser. Totals never leave the device, and
          there is no account. Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          , or{" "}
          <Link className="text-mint underline" href="/finance/credit-utilization-calculator">
            credit utilization calculator
          </Link>
          . For a house-wash mix estimate, use the{" "}
          <Link className="text-mint underline" href="/home/soft-wash-mix-calculator">
            soft wash mix calculator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the monthly budget template
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Replace the sample income rows with your paychecks or other monthly income.</li>
          <li>Edit expense categories, labels, and amounts — or add and remove rows.</li>
          <li>Include a savings line if you want a savings rate in the results.</li>
          <li>Read total income, total expenses, remaining surplus or deficit, and savings rate.</li>
          <li>Copy or print the summary if you want a snapshot. Nothing is uploaded.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
