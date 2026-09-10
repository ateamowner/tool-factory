import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { BreakEvenSalesCalculator } from "@/components/tools/BreakEvenSalesCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/break-even-sales-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "Break Even Sales Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What does break-even sales mean?",
    answer:
      "Break-even sales is the revenue (or unit volume) where total contribution margin exactly covers fixed costs and profit is zero. Sell one more unit and you start earning; sell fewer and you still lose money. This page reports both whole units and the matching sales dollars.",
  },
  {
    question: "What is the difference between fixed and variable costs?",
    answer:
      "Fixed costs stay the same in the period no matter how many units you sell — rent, salaried payroll, insurance, software. Variable costs rise with each unit — materials, piece-rate labor, shipping, payment fees. Break-even math needs both: fixed costs in the numerator, and price minus variable cost per unit in the denominator.",
  },
  {
    question: "What is contribution margin?",
    answer:
      "Contribution margin per unit is selling price minus variable cost per unit — the cash each sale leaves to cover fixed costs and then profit. Contribution margin percent is that amount divided by price. A $20 price and $12 variable cost is an $8 margin, or 40%.",
  },
  {
    question: "How does the break-even sales formula work?",
    answer:
      "Break-even units = fixed costs ÷ contribution margin per unit. Break-even sales = break-even units × price, which is the same as fixed costs ÷ contribution margin ratio. This calculator ceils units to a whole number (you cannot sell a fraction of a unit) and also shows the exact figure. Add an optional target profit to the fixed-cost numerator to see units and revenue for that profit.",
  },
  {
    question: "Is this the same as a break even calculator or break-even point calculator?",
    answer:
      "Yes. People also search for break even calculator and break-even point calculator. Those names all point at this same break even sales calculator page. There is no second URL for those aliases.",
  },
  {
    question: "What if price is less than or equal to variable cost?",
    answer:
      "Then contribution margin is zero or negative, and there is no break-even — extra sales cannot cover fixed costs, so the unit result is infinite. Raise the price, lower variable cost, or both before the formula can return a finite volume.",
  },
  {
    question: "Does this break even sales calculator upload my numbers?",
    answer:
      "No. Fixed costs, variable cost, price, and optional target profit are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
];

export const metadata: Metadata = {
  title: "Break Even Sales Calculator — Units, Revenue & Margin",
  description:
    "Free break even sales calculator. Enter fixed costs, variable cost, and price to see contribution margin, break-even units, and sales revenue. Optional target profit. Runs in your browser.",
  alternates: { canonical: href },
};

export default function BreakEvenSalesCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Break Even Sales Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the units and sales revenue where contribution margin covers fixed
        costs. Optional target profit shows the extra volume to earn that
        amount.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Units + sales</li>
        <li className="chip inline-flex">Contribution margin</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <BreakEvenSalesCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A break even sales calculator answers a practical question: at this
          price, after variable cost, how many units — and how many sales
          dollars — cover the fixed costs of the period? Enter fixed costs,
          variable cost per unit, and selling price. The page is also the
          break even calculator and break-even point calculator; those aliases
          stay here.
        </p>
        <p>
          Contribution margin is price minus variable cost. Divide fixed costs
          by that margin for exact break-even units, then ceil to a whole unit
          for the volume you actually have to sell. Sales revenue is that
          volume times price, which matches fixed costs divided by the
          contribution-margin ratio. An optional target profit is added to
          fixed costs before the same steps.
        </p>
        <p>
          If price is at or below variable cost, there is no break-even —
          margin cannot cover fixed costs. Results are educational estimates,
          not accounting advice. Everything runs in your browser. Totals never
          leave the device, and there is no account.
        </p>
        <p>
          Browse more calculators on the{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/vat-number-validator">
            VAT number validator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/real-estate-commission-calculator">
            real estate commission calculator
          </Link>
          , or{" "}
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
          How to use the break even sales calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter total fixed costs for the period.</li>
          <li>Enter variable cost per unit and selling price per unit.</li>
          <li>Optionally enter a target profit to see units and sales beyond break-even.</li>
          <li>Read contribution margin, whole break-even units, exact units, and sales revenue.</li>
          <li>If price is not above variable cost, raise price or lower variable cost — there is no finite break-even.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
