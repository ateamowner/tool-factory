import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { FutureValueCalculator } from "@/components/tools/FutureValueCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/future-value-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Future Value Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a future value calculator work?",
    answer:
      "A future value calculator compounds an initial investment (present value) and optional periodic contributions at an annual interest rate. You choose compounding frequency — annual, monthly, daily, or similar — and a number of years. The page returns future value, total money you put in, interest earned, and a year-by-year schedule. Everything runs in the browser.",
  },
  {
    question: "What is the future value formula?",
    answer:
      "For a lump sum, FV = PV × (1 + r/n)^(n × t), where r is the annual rate, n is compounding periods per year, and t is years. Optional deposits use the ordinary-annuity formula FV = PMT × [((1 + i)^N − 1) / i], where i is the rate per contribution period and N is the number of deposits. Deposits at the start of each period (annuity due) multiply that annuity result by (1 + i).",
  },
  {
    question: "What is compound interest?",
    answer:
      "Compound interest means you earn interest on both the original principal and interest already credited. Monthly compounding of 5% on $10,000 for one year is about $10,511.62 — a little more than the $10,500 from annual compounding of the same 5%. Daily compounding is slightly higher still. This future value calculator applies that compounding to both the starting amount and later contributions.",
  },
  {
    question: "How do periodic contributions change future value?",
    answer:
      "Each contribution is added on its own schedule — monthly, quarterly, semiannual, or annual — then compounds for the remaining time. $10,000 plus $200 a month at 7% compounded monthly for 10 years is about $54,700, versus about $20,100 for the $10,000 lump sum alone. End-of-period deposits are the usual default; start-of-period deposits earn one extra interval of interest.",
  },
  {
    question: "What is the difference between annual, monthly, and daily compounding?",
    answer:
      "The same nominal annual rate produces a slightly higher future value when it compounds more often. $10,000 at 5% for one year is $10,500 annually, about $10,511.62 monthly, and about $10,512.67 daily (365 periods). If contribution frequency differs from compounding, this calculator converts the annual rate to an effective rate per contribution period.",
  },
  {
    question: "How is this different from the CD rate calculator?",
    answer:
      "This future value calculator is for a present value, optional ongoing contributions, a nominal annual rate, compounding frequency, and a term in years. The CD rate calculator is for a single certificate-of-deposit deposit with APY or interest rate and a term in months or years. There is no second URL for FV aliases — use this page for future value.",
  },
  {
    question: "Does this future value calculator upload my numbers?",
    answer:
      "No. Initial investment, contributions, rate, compounding, and years are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this future value calculator financial advice?",
    answer:
      "No. Results are an educational estimate of compound interest from the numbers you enter. Posted rates, day-count conventions, fees, taxes, and sequence of returns can differ. Check the account terms or a qualified advisor before you invest.",
  },
];

export const metadata: Metadata = {
  title: "Future Value Calculator — Compound Interest & Growth",
  description:
    "Free future value calculator. Enter an initial investment, optional periodic contribution, annual interest rate, compounding frequency, and years to see future value and interest earned. Runs in your browser.",
  alternates: { canonical: href },
};

export default function FutureValueCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Future Value Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate what an initial investment is worth later — plus optional
        periodic contributions — from an annual interest rate, compounding
        frequency, and number of years. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">PV + contributions</li>
        <li className="chip inline-flex">Compound interest</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <FutureValueCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A future value calculator answers a time-value-of-money question: if
          you invest a known amount today, and maybe add a regular contribution,
          what is that money worth after a stated number of years at a given
          annual rate? Enter present value, an optional deposit, how often you
          contribute, the rate, compounding, and years.
        </p>
        <p>
          The lump-sum formula is FV = PV × (1 + r/n)^(n × t). Optional
          end-of-period deposits add PMT × [((1 + i)^N − 1) / i]. Example:
          $10,000 at 5% compounded annually for one year is $10,500. The same
          5% compounded monthly is about $10,511.62. $10,000 plus $200 a month
          at 7% monthly for 10 years is about $54,700.
        </p>
        <p>
          Results are educational estimates, not financial advice. Posted rates,
          fees, and taxes can differ. Everything runs in your browser. Totals
          never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/cd-rate-calculator">
            CD rate calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/403b-calculator">
            403b calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/discount-calculator">
            discount calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the future value calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the initial investment (present value). Use 0 if you will only contribute over time.</li>
          <li>Optionally enter a periodic contribution and how often you add it (monthly is common).</li>
          <li>Choose end-of-period deposits (ordinary annuity) or start-of-period (annuity due).</li>
          <li>Enter the annual interest rate % and compounding frequency (annual, monthly, or daily).</li>
          <li>Enter the number of years, then read future value, total contributions, interest, and the schedule.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
