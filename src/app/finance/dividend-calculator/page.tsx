import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { DividendCalculator } from "@/components/tools/DividendCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/dividend-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Dividend Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate dividend income?",
    answer:
      "Multiply your shares by the annual dividend per share. 100 shares paying $2.00 a year earn $200 a year. If the stock pays quarterly, that is $50 per payout. If you only know the yield, multiply the share price by the yield first: a $50 stock yielding 4% pays $2.00 per share.",
  },
  {
    question: "What is dividend yield?",
    answer:
      "Dividend yield is the annual dividend per share divided by the share price, shown as a percent. A $2.00 annual dividend on a $50 share is a 4% yield. The yield moves when the price moves, so a falling price can make a yield look higher without the company paying more.",
  },
  {
    question: "What is DRIP and how does the projection work?",
    answer:
      "DRIP means dividend reinvestment plan. Each payout buys more shares, and those new shares earn dividends too. The calculator reinvests every payout at the projected share price. With a flat price, 100 shares at a 4% yield grow to about 148 shares in 10 years with annual payouts.",
  },
  {
    question: "How does dividend growth change the result?",
    answer:
      "Many companies raise their dividend each year. Enter a growth rate and the dividend per share rises every year of the projection. A 4% starting yield with 6% yearly dividend growth pays far more by year 10 than a flat dividend does, and the table shows the difference year by year.",
  },
  {
    question: "Does payout frequency matter?",
    answer:
      "Not for the annual amount, which stays the same. With DRIP, more frequent payouts reinvest sooner, so monthly or quarterly payers compound slightly faster than annual payers. The difference is small at typical yields.",
  },
  {
    question: "Are dividends taxed?",
    answer:
      "In a taxable account, dividends are generally taxed in the year you receive them, even if you reinvest them. Qualified dividends are usually taxed at lower long-term capital gains rates. This calculator ignores taxes and fees, so your real result will be lower. Check with a tax professional for your situation.",
  },
  {
    question: "How do I track my cost basis when I reinvest dividends?",
    answer:
      "Each reinvested payout is a new purchase at that day's price, so your average cost changes over time. Use the stock average calculator to combine your lots into one average cost per share, and the future value calculator to see how a lump sum grows at a steady rate.",
  },
  {
    question: "Does this dividend calculator upload my numbers?",
    answer:
      "No. Your shares, price, and dividend are calculated in your browser. Nothing is sent to a server or stored on our side, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Dividend Calculator — Annual Income & DRIP Projection",
  description:
    "Free dividend calculator. Enter shares or amount invested, price, and dividend or yield to see annual and per-payout income, plus a DRIP projection over the years with optional dividend growth.",
  alternates: { canonical: href },
};

export default function DividendCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Dividend Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate how much dividend income a stock position pays each year and
        each payout. Enter shares or a dollar amount, the share price, and the
        dividend per share or yield, then project dividend reinvestment (DRIP)
        over the years with optional dividend growth. Everything runs in the
        browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Annual and per-payout income</li>
        <li className="chip inline-flex">DRIP projection</li>
        <li className="chip inline-flex">Dividend growth</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <DividendCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Dividend income is shares × annual dividend per share. Divide by how
          often the stock pays (1, 2, 4, or 12 times a year) for the amount of
          each payout. 100 shares at $2.00 a year earn $200 a year, or $50 a
          quarter. Starting from a dollar amount instead, the calculator divides
          by the share price to find the shares you would own.
        </p>
        <p>
          The DRIP projection reinvests each payout into more shares at the
          projected price. Set dividend growth to model a company that raises
          its payout every year, and share price growth to model a rising or
          falling stock. The table shows shares, dividends, and portfolio value
          for every year, and the summary compares total dividends with and
          without reinvesting.
        </p>
        <p>
          Results assume constant growth rates, no taxes, no fees, and no
          cuts to the dividend. They are estimates, not financial advice.
          Numbers never leave the device, and there is no account.
        </p>
        <p>
          Reinvesting changes your cost per share over time. Combine your buys
          with the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          , and see how a lump sum grows at a steady rate with the{" "}
          <Link className="text-mint underline" href="/finance/future-value-calculator">
            future value calculator
          </Link>
          . Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the dividend calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter your number of shares, or the dollar amount you invested.</li>
          <li>Enter the share price and the annual dividend per share, or the yield.</li>
          <li>Pick how often the stock pays: annual, semiannual, quarterly, or monthly.</li>
          <li>Set the years, dividend growth, and price growth for the DRIP projection.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
