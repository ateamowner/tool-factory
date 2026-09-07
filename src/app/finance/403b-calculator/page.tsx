import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { FourOhThreeBCalculator } from "@/components/tools/FourOhThreeBCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl, publicPageMetadata } from "@/lib/site";

const href = "/finance/403b-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "403b Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a 403b calculator work?",
    answer:
      "A 403b calculator projects your plan balance from your current age to retirement. Each year it adds your employee contribution and any employer match, applies the IRS elective deferral estimate cap, then compounds the balance at the return you entered. Optional salary raises increase later-year contributions when you use a percent.",
  },
  {
    question: "What is the difference between a 403(b) and a 401(k)?",
    answer:
      "Both are workplace retirement plans with elective deferrals, possible employer match, and annual IRS limits. A 403(b) is typically offered by public schools, hospitals, and certain nonprofits. A 401(k) is more common at for-profit employers. Investment menus and plan rules differ; this page models contributions and growth, not a specific vendor’s lineup.",
  },
  {
    question: "What are the 403(b) contribution limits?",
    answer:
      "This calculator uses a clearly labeled 2026 estimate placeholder: $23,500 employee elective deferral if you are under 50, plus a $7,500 catch-up estimate at age 50 or older. Those figures are not tax advice and can change. Your plan may also set a lower cap, and employer contributions have a separate annual-additions limit that this page does not model.",
  },
  {
    question: "How does employer match work in a 403(b)?",
    answer:
      "Many plans match a percent of what you defer, only up to a percent of salary — for example, 50% of contributions up to 6% of pay. Enter those two optional fields and the calculator matches the lesser of your employee deferral and that salary cap, then multiplies by the match percent. Leave them blank or at 0 if your plan does not match.",
  },
  {
    question: "What are 403(b) catch-up contributions?",
    answer:
      "Starting in the year you turn 50, IRS rules generally allow extra elective deferrals above the standard limit. This 403b calculator adds a $7,500 catch-up estimate for every year your age is 50 or older. Some 403(b) plans also have a 15-year service catch-up; that extra rule is not modeled here.",
  },
  {
    question: "How does this 403b calculator project the retirement balance?",
    answer:
      "It treats each working year as: apply any salary raise after year one, compute the employee amount from your percent or a flat dollar override, cap that amount at the 2026 elective-deferral estimate, add employer match, then grow the combined balance at your annual return. Growth is an estimate, not a forecast of any fund.",
  },
  {
    question: "Does this 403b calculator upload my data?",
    answer:
      "No. Age, salary, contribution rate, match, and return are calculated in your browser. Nothing is sent to a server or stored on our side.",
  },
  {
    question: "Is this 403b calculator tax or investment advice?",
    answer:
      "No. Results are an educational estimate only. Contribution limits change, plan rules vary, returns are not guaranteed, and taxes on withdrawals are not modeled. Check your plan documents or a qualified advisor before you change contributions.",
  },
];

export const metadata: Metadata = {
  title: "403b Calculator — Contribution, Match & Retirement Balance",
  description:
    "Free 403b calculator. Estimate employee contributions, employer match, and projected retirement balance. Runs in your browser — nothing is uploaded.",
  ...publicPageMetadata(href),
};

export default function FourOhThreeBCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        403b Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate 403(b) employee contributions, optional employer match, and a
        projected balance at retirement. Limits are labeled 2026 estimates, not
        tax advice.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Contribution + match</li>
        <li className="chip inline-flex">Retirement balance</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <FourOhThreeBCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A 403b calculator answers a practical question: if you keep deferring
          a percent of salary — or a flat dollar amount — and your employer
          matches part of it, what might the plan be worth when you retire?
          Enter your current age, retirement age, balance, and salary, then
          adjust return and optional raises.
        </p>
        <p>
          Each year the math adds your employee elective deferral and any
          match, caps the employee amount at a 2026 IRS estimate placeholder
          ($23,500 under 50, plus a $7,500 catch-up estimate at 50+), and
          compounds the balance. A dollar override stays flat; a percent grows
          with raises. Results are educational estimates only. Contribution
          limits change, plan rules vary, and this is not tax or investment
          advice.
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
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the 403b calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter your current age, target retirement age, and current 403(b) balance.</li>
          <li>Add annual salary and an employee contribution percent, or a flat dollar amount.</li>
          <li>Optionally enter employer match percent and the salary-percent cap it applies to.</li>
          <li>Set an expected annual return and, if you want, an annual salary raise.</li>
          <li>Read the projected balance, contribution totals, growth, and the optional year-by-year table.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
