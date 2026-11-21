import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CapRateCalculator } from "@/components/tools/CapRateCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/cap-rate-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Cap Rate Calculator", href },
];

const faqs: FaqItem[] = [
  {
    "question": "What is a cap rate?",
    "answer": "Cap rate, short for capitalization rate, is a property's net operating income (NOI) divided by its value or purchase price, shown as a percent. It measures the yearly return from the property itself, before any mortgage. A $400,000 property with $22,200 of NOI has a cap rate of 5.55%."
  },
  {
    "question": "How do you calculate cap rate?",
    "answer": "Subtract vacancy and operating expenses from gross rental income to get NOI, then divide NOI by the property value. Cap rate = NOI ÷ value × 100. With $36,000 of rent, 5% vacancy, and $12,000 of expenses, NOI is $22,200 and the cap rate on $400,000 is 5.55%."
  },
  {
    "question": "What is a good cap rate?",
    "answer": "It depends on the market, property type, and risk. Lower cap rates usually mean higher prices and lower risk, and higher cap rates mean more yield with more risk. Compare a property to similar ones in the same area rather than to a single target number."
  },
  {
    "question": "Does cap rate include the mortgage?",
    "answer": "No. Cap rate ignores financing, so mortgage payments, interest, and principal are not part of operating expenses. Use a cash-on-cash or ROI calculation to see returns after debt."
  },
  {
    "question": "What counts as operating expenses?",
    "answer": "Property taxes, insurance, repairs and maintenance, property management, utilities you pay, and similar running costs. Leave out mortgage payments, depreciation, income taxes, and big capital improvements."
  },
  {
    "question": "How do I find a property's value from its cap rate?",
    "answer": "Divide NOI by the cap rate. A property with $22,200 of NOI at a 6% cap rate implies a value of $370,000. This calculator shows that implied value for any target cap rate you enter."
  },
  {
    "question": "Is my data sent anywhere?",
    "answer": "No. All math runs in your browser. Nothing you type is uploaded or stored."
  },
  {
    "question": "Can the cap rate be negative?",
    "answer": "Yes. If operating expenses are greater than effective income, NOI is negative and so is the cap rate. The calculator shows that result instead of hiding it."
  }
];

export const metadata: Metadata = {
  title: "Cap Rate Calculator — NOI and Capitalization Rate",
  description:
    "Free cap rate calculator. Enter value, rent, vacancy, and expenses to get NOI and the capitalization rate, plus the value implied by a target cap rate. Nothing is uploaded.",
  alternates: { canonical: href },
};

export default function CapRateCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Cap Rate Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Work out the capitalization rate of a rental property. Enter the price,
        gross rent, vacancy, and operating expenses to see net operating income
        and the cap rate. Add a target cap rate to see what value it implies.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">NOI and cap rate</li>
        <li className="chip inline-flex">Vacancy loss</li>
        <li className="chip inline-flex">Implied value</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <CapRateCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Cap rate compares what a property earns in a year to what it costs.
          It uses net operating income, which is rent minus vacancy and the
          costs of running the building, and leaves out financing. That makes
          it a quick way to compare rental properties on equal footing.
        </p>
        <p>
          Example: a duplex priced at $400,000 collects $36,000 a year in rent.
          At 5% vacancy, effective income is $34,200. With $12,000 of operating
          expenses, NOI is $22,200 and the cap rate is 5.55%. At a 6% target,
          that NOI would support a value of $370,000.
        </p>
        <p>
          To see how the same investment performs on your own cash, try the{" "}
          <Link className="text-mint underline" href="/finance/roi-calculator">
            ROI calculator
          </Link>
          . Planning financing? The{" "}
          <Link className="text-mint underline" href="/finance/mortgage-recast-calculator">
            mortgage recast calculator
          </Link>{" "}
          shows how a lump-sum payment changes your payment. Browse more tools on
          the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning, not investment advice. Rents,
          expenses, and market cap rates vary by property and location.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the cap rate calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the property value or purchase price.</li>
          <li>Enter gross annual rental income and a vacancy percent.</li>
          <li>Enter operating expenses in dollars a year or as a percent of income.</li>
          <li>Read the NOI and cap rate.</li>
          <li>Enter a target cap rate to see the value it implies.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
