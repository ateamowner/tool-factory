import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RoiCalculator } from "@/components/tools/RoiCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/roi-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "ROI Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does an ROI calculator work?",
    answer:
      "An ROI calculator starts from an initial investment (cost) and either a final value or a net profit (gain). ROI % = ((final value − initial investment) / initial investment) × 100. Net profit = final value − initial. From cost plus gain it also returns the implied final value. Everything runs in the browser.",
  },
  {
    question: "What is the ROI formula?",
    answer:
      "Return on investment percent = ((final value − initial investment) / initial investment) × 100. Net profit = final value − initial investment. Example: $1,000 invested and a $1,500 final value is $500 profit and a 50% ROI. A $0 final value is a total loss and −100% ROI.",
  },
  {
    question: "What is the difference between ROI and profit margin?",
    answer:
      "ROI is return relative to what you invested (cost). Margin is profit relative to selling price or revenue. The same $500 profit on a $1,000 investment is a 50% ROI. If that $1,500 were a selling price, margin would be ((1,500 − 1,000) / 1,500) ≈ 33.33%. Use the markup calculator when you need markup vs margin on a product cost.",
  },
  {
    question: "Can ROI be negative?",
    answer:
      "Yes. When final value is below the initial investment, net profit is negative and ROI % is negative. Example: $1,000 in and $750 out is −$250 and −25% ROI. A total loss (final value $0) is −100% ROI. This calculator allows those cases as long as final value is not below $0.",
  },
  {
    question: "Is this the same as a return on investment calculator?",
    answer:
      "Yes. People also search for return on investment calculator or investment ROI calculator. Those names point at this same ROI calculator page. There is no second URL for those aliases.",
  },
  {
    question: "What numbers can I enter?",
    answer:
      "Initial investment, final value, and net profit must be finite. Initial investment must be greater than 0 because ROI divides by cost. Final value must be 0 or more. Net profit can be negative for a loss, but cannot leave a negative final value.",
  },
  {
    question: "Does this ROI calculator upload my numbers?",
    answer:
      "No. Initial investment, final value, and net profit are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this investment advice?",
    answer:
      "No. Results are an educational estimate of return on investment from the numbers you enter. Fees, taxes, time period, and risk can differ. Check a qualified advisor before you invest.",
  },
];

export const metadata: Metadata = {
  title: "ROI Calculator — Return on Investment % & Profit",
  description:
    "Free ROI calculator. Enter an initial investment and final value (or net profit) to see ROI percent and gain. Runs in your browser.",
  alternates: { canonical: href },
};

export default function RoiCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        ROI Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Measure return on investment from an initial cost and a final value — or
        from cost plus net profit. See ROI %, gain or loss, and ending value.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">ROI %</li>
        <li className="chip inline-flex">Net profit</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <RoiCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An ROI calculator answers a simple investing question: relative to what
          you put in, how much did you make or lose? Enter the initial investment
          and either the final value of the asset or the net profit (gain). The
          page returns ROI percent, net profit, and final value.
        </p>
        <p>
          The formula is ROI % = ((final value − initial investment) / initial
          investment) × 100. Net profit = final − initial. Example: $1,000
          invested and $1,500 final value is $500 profit and a 50% ROI. The same
          $1,000 with a $0 final value is a total loss and −100% ROI.
        </p>
        <p>
          Results are educational estimates, not investment advice. Fees, taxes,
          and holding period can differ. Everything runs in your browser. Totals
          never leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/future-value-calculator">
            future value calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/markup-calculator">
            markup calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/break-even-sales-calculator">
            break even sales calculator
          </Link>
          , and{" "}
          <Link className="text-mint underline" href="/finance/discount-calculator">
            discount calculator
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
          How to use the ROI calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a mode: cost + final value, or cost + net profit.</li>
          <li>Enter an initial investment greater than 0.</li>
          <li>Enter the final value (0 or more) or the net profit (negative for a loss).</li>
          <li>Read ROI %, net profit, and final value in the results panel.</li>
          <li>Remember ROI is on cost — use the markup calculator if you need margin on price.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
