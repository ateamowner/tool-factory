import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CdRateCalculator } from "@/components/tools/CdRateCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/cd-rate-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "CD Rate Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a CD rate calculator work?",
    answer:
      "A CD rate calculator compounds a deposit over the certificate of deposit term. Enter the opening balance, an APY or a nominal interest rate, the term in months or years, and how often interest compounds. You see ending balance, interest earned, the matching APY or interest rate, yield over the full term, and a year-by-year schedule.",
  },
  {
    question: "What is the difference between APY and the interest rate on a CD?",
    answer:
      "APY is the effective annual yield after compounding. The interest rate (nominal annual rate) is the quoted rate before compounding is applied. Monthly compounding on a 5% interest rate is about 5.12% APY and turns $10,000 into about $10,511.62 after one year. The same 5% APY always pays $500 on $10,000 in one year, no matter the compounding frequency.",
  },
  {
    question: "How is CD interest compounded?",
    answer:
      "Banks typically compound daily, monthly, quarterly, semiannually, or annually. This CD rate calculator also offers continuous compounding. Ending balance = deposit × (1 + APY)^years. When you enter a nominal interest rate, APY = (1 + r/n)^n − 1, where n is periods per year (365 for daily). Continuous APY is e^r − 1.",
  },
  {
    question: "What numbers do I need for this CD rate calculator?",
    answer:
      "Enter the deposit amount, the APY printed on the offer (or the nominal interest rate), the CD term, and the compounding frequency from the account agreement. A 12-month term and a 1-year term are the same. Early-withdrawal penalties, promotional teaser rates, and taxes are not included.",
  },
  {
    question: "How do I enter a CD term in months versus years?",
    answer:
      "Use months for common retail terms such as 3, 6, 9, 12, 18, or 24 months. Use years for multi-year CDs. 18 months is treated as 1.5 years, so the schedule shows a full first year and a half-year stub to maturity.",
  },
  {
    question: "Does more frequent compounding always earn more interest?",
    answer:
      "Only when you start from a nominal interest rate. Daily compounding of 5% earns a little more than monthly or annual compounding of 5%. If the bank quotes APY, compounding is already in that number — changing the frequency only restates the implied interest rate, not the ending balance.",
  },
  {
    question: "Does this CD rate calculator upload my numbers?",
    answer:
      "No. Deposit, APY or interest rate, term, and compounding are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this CD rate calculator financial advice?",
    answer:
      "No. Results are an educational estimate of compound interest on a certificate of deposit from the numbers you enter. Posted APYs, day-count conventions, compounding calendars, early-withdrawal penalties, FDIC coverage, and taxes vary. Check the offer documents or a qualified advisor before you open a CD.",
  },
];

export const metadata: Metadata = {
  title: "CD Rate Calculator — APY, Term & Ending Balance",
  description:
    "Free CD rate calculator. Enter deposit, APY or interest rate, term, and compounding to see ending balance, interest earned, and a year-by-year schedule. Runs in your browser.",
  alternates: { canonical: href },
};

export default function CdRateCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        CD Rate Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate what a certificate of deposit pays — ending balance, interest
        earned, and a year-by-year schedule — from deposit, APY or interest
        rate, term, and compounding. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">APY or interest rate</li>
        <li className="chip inline-flex">Term + compounding</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CdRateCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A CD rate calculator answers a savings question: if you lock a
          deposit in a certificate of deposit at a stated APY (or interest
          rate) for a known term, what is the ending balance and how much
          interest did you earn? Enter the opening deposit, the rate from the
          offer, months or years, and how often the bank compounds.
        </p>
        <p>
          APY already includes compounding, so $10,000 at 5% APY for one year
          is $10,500. A 5% nominal interest rate compounded monthly is about
          5.12% APY and about $10,511.62. The year-by-year schedule shows
          beginning balance, interest that year, and ending balance — including
          a stub year when the term is not a whole number of years (18 months
          is 1.5 years).
        </p>
        <p>
          Results are educational estimates, not financial advice. Posted CD
          APYs, day-count conventions, early-withdrawal penalties, and taxes
          can differ. Everything runs in your browser. Totals never leave the
          device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/purchasing-power-calculator">
            purchasing power calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/403b-calculator">
            403b calculator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
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
          How to use the CD rate calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the CD deposit amount (greater than 0).</li>
          <li>Choose APY (the usual bank quote) or nominal interest rate.</li>
          <li>Enter the annual percent from the offer.</li>
          <li>Enter the term in months or years, then pick compounding frequency.</li>
          <li>Read ending balance, interest earned, APY, and the year-by-year schedule.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
