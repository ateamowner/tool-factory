import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { StraightLineDepreciationCalculator } from "@/components/tools/StraightLineDepreciationCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/straight-line-depreciation-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Straight Line Depreciation Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a straight line depreciation calculator work?",
    answer:
      "A straight line depreciation calculator subtracts salvage (residual) value from asset cost to get depreciable basis, then divides by useful life in years. That annual expense is the same each full year. The schedule starts at cost, subtracts depreciation, and ends at salvage. Optional first-year fraction or a placed-in-service date scales year one and leaves a stub year for the leftover fraction.",
  },
  {
    question: "What is the straight-line depreciation formula?",
    answer:
      "Annual depreciation = (Cost − Salvage) ÷ Useful life years. Monthly is that annual amount divided by 12. Example: a $25,000 asset, $2,500 salvage, and 5-year life has a $22,500 basis and $4,500 of SL depreciation each year ($375 per month).",
  },
  {
    question: "What is depreciable basis?",
    answer:
      "Depreciable basis is cost minus salvage. It is the total you expect to write off over the asset’s life. Book value starts at cost and falls by each year’s depreciation until it equals salvage. If salvage equals cost, basis and annual expense are zero.",
  },
  {
    question: "How do I handle a partial first year or placed-in-service date?",
    answer:
      "Enter a first-year fraction between 0 and 1 (0.5 is a half-year convention), or pick a placed-in-service date. A date uses remaining calendar days in that year, including the in-service day, divided by 365 or 366. Year one takes that fraction of annual expense; later full years take the usual amount; a final stub year finishes the leftover so book value lands on salvage.",
  },
  {
    question: "Is this the same as a straight-line depreciation calculator or SL depreciation?",
    answer:
      "Yes. People also search for a straight-line depreciation calculator or SL depreciation. Those names all point at this same straight line depreciation calculator page. There is no second URL for those aliases.",
  },
  {
    question: "What if salvage is greater than cost?",
    answer:
      "That is not a valid straight-line setup. Residual value cannot exceed the cost basis. Lower salvage, raise cost, or both. Useful life must also be greater than zero, and cost and salvage must be finite, non-negative numbers.",
  },
  {
    question: "Does this straight line depreciation calculator upload my numbers?",
    answer:
      "No. Cost, salvage, useful life, first-year fraction, and placed-in-service date are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this tax or accounting advice?",
    answer:
      "No. Results are an educational estimate of book depreciation under the straight-line method you enter. Tax lives, half-year or mid-month conventions, section 179, bonus depreciation, and IFRS/GAAP presentation can differ. Check a qualified advisor before you file or book entries.",
  },
];

export const metadata: Metadata = {
  title: "Straight Line Depreciation Calculator — SL Schedule",
  description:
    "Free straight line depreciation calculator. Enter cost, salvage, and useful life for annual expense, basis, and a book-value schedule. Runs in your browser.",
  alternates: { canonical: href },
};

export default function StraightLineDepreciationCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Straight Line Depreciation Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Spread an asset’s cost minus salvage evenly over its useful life. See
        annual SL depreciation, optional monthly (annual ÷ 12), and a
        year-by-year book-value schedule — all in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Annual + monthly</li>
        <li className="chip inline-flex">Book-value schedule</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <StraightLineDepreciationCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A straight line depreciation calculator answers a practical books
          question: if this asset costs a known amount and will be worth a
          salvage (residual) value after a set number of years, how much
          expense do you take each year, and what is book value along the
          way? Enter cost, salvage, and useful life.
        </p>
        <p>
          The formula is annual depreciation = (cost − salvage) ÷ useful life
          years. That is SL depreciation: the same amount every full year.
          People also search this as a straight-line depreciation calculator —
          the comparison is the same. There is no second URL for those
          aliases. Monthly is simply the annual figure divided by 12.
        </p>
        <p>
          Optional first-year fraction or a placed-in-service date scales year
          one when the asset was not in service for a full calendar year. The
          schedule then adds a stub year for the leftover fraction so ending
          book value equals salvage. Results are educational estimates, not
          tax advice. Everything runs in your browser. Totals never leave the
          device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/purchasing-power-calculator">
            purchasing power calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/403b-calculator">
            403b calculator
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
          How to use the straight line depreciation calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter asset cost (basis) and salvage or residual value.</li>
          <li>Enter useful life in years (must be greater than 0).</li>
          <li>Optionally enter a first-year fraction (0–1) or a placed-in-service date.</li>
          <li>Read annual depreciation, monthly (annual ÷ 12), and depreciable basis.</li>
          <li>Use the year-by-year table for beginning book value, depreciation, and ending book value.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
