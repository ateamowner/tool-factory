import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PaycheckCalculatorHourly } from "@/components/tools/PaycheckCalculatorHourly";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/paycheck-calculator-hourly";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Paycheck Calculator Hourly", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a paycheck calculator hourly work?",
    answer:
      "A paycheck calculator hourly multiplies your hourly rate by hours per week to get weekly gross pay, then scales that to annual, monthly, and per-paycheck amounts from your pay frequency. Weekly is 52 periods, biweekly 26, semimonthly 24, and monthly 12.",
  },
  {
    question: "Does this paycheck calculator hourly include overtime?",
    answer:
      "Optionally. Turn on overtime to treat hours over 40 in a week at 1.5 times your hourly rate. Hours at or under 40 stay at the regular rate. Salary mode does not apply overtime.",
  },
  {
    question: "Are these paycheck figures after taxes?",
    answer:
      "No. Every total on this page is gross pay before taxes, retirement, insurance, or other deductions. There is no 50-state tax engine and no federal or FICA withholding.",
  },
  {
    question: "What is the difference between biweekly and semimonthly pay?",
    answer:
      "Biweekly is every two weeks, 26 paychecks a year. Semimonthly is twice a month, usually on fixed calendar dates, for 24 paychecks a year. The same annual gross is split across more checks when you are paid biweekly.",
  },
  {
    question: "Does this paycheck calculator hourly upload my pay data?",
    answer:
      "No. Hourly rate, salary, hours, and frequency are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Can I switch from hourly to salary?",
    answer:
      "Yes. Use the Hourly / Salary toggle. Hourly mode starts from rate and hours. Salary mode starts from annual salary and still uses hours per week to show an hourly equivalent.",
  },
];

export const metadata: Metadata = {
  title: "Paycheck Calculator Hourly — Gross Pay Per Paycheck",
  description:
    "Free paycheck calculator hourly for weekly, biweekly, semimonthly, or monthly pay. Enter hourly rate or salary and hours to see gross pay per paycheck, week, month, and year. Runs in your browser.",
  alternates: { canonical: href },
};

export default function PaycheckCalculatorHourlyPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Paycheck Calculator Hourly
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Turn an hourly rate or annual salary into gross pay per paycheck, week,
        month, and year.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Hourly or salary</li>
        <li className="chip inline-flex">Gross / pre-tax</li>
        <li className="chip inline-flex">Optional overtime</li>
      </ul>

      <div className="mt-8">
        <PaycheckCalculatorHourly />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A paycheck calculator hourly answers a simple question: if you earn a
          given rate and work a given week, what lands on each check before
          taxes? Enter your hourly rate, hours per week, and how often you are
          paid. The page also accepts annual salary if you want the same
          breakdown from a yearly figure.
        </p>
        <p>
          Weekly pay uses 52 periods, biweekly 26, semimonthly 24, and monthly
          12. Overtime is optional and stays simple: hours over 40 in a week
          are paid at 1.5 times the hourly rate. Figures are gross — they do
          not subtract federal, FICA, or state tax.
        </p>
        <p>
          Everything runs in your browser. Rates never leave the device, and
          there is no account. Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          . Need local identifiers? Try the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the paycheck calculator hourly
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose hourly or salary.</li>
          <li>Enter your hourly rate, or your annual salary.</li>
          <li>Set hours per week and your pay frequency.</li>
          <li>Optionally count hours over 40 as overtime at 1.5×.</li>
          <li>Read gross pay per paycheck, weekly, monthly, and annual.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
