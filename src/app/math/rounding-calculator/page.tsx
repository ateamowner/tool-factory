import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RoundingCalculator } from "@/components/tools/RoundingCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/rounding-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Rounding Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do you round a number?",
    answer:
      "Find the place you are rounding to, then look at the digit just to its right. If that digit is 5 or more, add 1 to the place you are keeping; if it is 4 or less, leave it alone. Then drop every digit after the kept place. For example, 3.14159 rounded to 2 decimal places is 3.14, because the next digit is 1.",
  },
  {
    question: "What does rounding half up mean?",
    answer:
      "Half up is the rounding most people learn in school. When the part you drop is exactly half, like the 5 in 2.5, the number rounds away from zero, so 2.5 becomes 3 and 7.25 becomes 7.3 at one decimal place. For negative numbers, this calculator also rounds the half away from zero, so −2.5 becomes −3.",
  },
  {
    question: "What is banker's rounding (round half to even)?",
    answer:
      "Banker's rounding, or half even, only changes how exact halves are handled. A half rounds to whichever neighbor ends in an even digit, so 2.5 becomes 2, 3.5 becomes 4 and 2.665 becomes 2.66. Because halves go up as often as they go down, totals of many rounded values stay closer to the true total. It is the default in many accounting systems and in the IEEE 754 standard.",
  },
  {
    question: "What is the difference between always up and always down?",
    answer:
      "Always up (ceiling) rounds toward positive infinity, so any leftover amount bumps the number up: 2.01 becomes 3. Always down (floor) rounds toward negative infinity, so the extra digits are simply dropped for positive numbers: 2.99 becomes 2. They are useful when you must never come in under or over a limit, like ordering enough boxes or staying within a budget.",
  },
  {
    question: "How are negative numbers rounded?",
    answer:
      "With half up and half even, a negative number rounds the same way as its positive twin and keeps the minus sign, so −3.14159 to 2 places is −3.14. Ceiling and floor follow the number line: the ceiling of −2.7 is −2 (closer to zero), and the floor of −2.1 is −3 (further from zero). The calculator shows every mode side by side so you can compare.",
  },
  {
    question: "How do I round to the nearest 10, 100 or 1,000?",
    answer:
      "Choose “Nearest 10,” “Nearest 100” or “Nearest 1,000.” The calculator looks at the digit just right of that place. Rounding 1,234 to the nearest 100 gives 1,200 because the tens digit is 3; rounding 1,250 to the nearest 100 gives 1,300 with half up but 1,200 with half even.",
  },
  {
    question: "Why do some calculators round 1.005 to 1.00?",
    answer:
      "Many programs store numbers in binary, and 1.005 is actually saved as 1.00499999…, so it rounds down to 1.00. This rounding calculator does exact decimal math on the digits you type, so 1.005 rounded to 2 decimal places is 1.01 with half up, just as you would do it by hand.",
  },
  {
    question: "Is rounding the same as truncating?",
    answer:
      "Not quite. Truncating cuts off the extra digits without looking at them, so 2.99 becomes 2 and −2.99 becomes −2. That matches always down for positive numbers and always up for negative numbers. Rounding to the nearest value looks at what you drop, so 2.99 rounds to 3. Everything runs in your browser, and nothing is uploaded.",
  },
];

export const metadata: Metadata = {
  title: "Rounding Calculator — Round to Decimal Places, 10, 100 or 1,000",
  description:
    "Free rounding calculator. Round any number to any number of decimal places or to the nearest whole number, 10, 100 or 1,000 using half up, half even (banker's), always up or always down, with steps.",
  alternates: { canonical: href },
};

export default function RoundingCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Rounding Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Round any number to as many decimal places as you need, or to the nearest
        whole number, 10, 100 or 1,000. Pick half up, half even (banker&apos;s
        rounding), always up or always down, see every mode side by side, and
        follow the steps. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Decimal places or nearest 10, 100, 1,000</li>
        <li className="chip inline-flex">Half up & banker&apos;s rounding</li>
        <li className="chip inline-flex">Ceiling & floor</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <RoundingCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Rounding replaces a number with a shorter one that is close to it. The
          four modes differ only in what they do with the digits you drop:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Half up:</strong> 5 or more rounds away from zero, 4 or less
            stays. 2.45 → 2.5 and −2.45 → −2.5 at one decimal place.
          </li>
          <li>
            <strong>Half even (banker&apos;s):</strong> like half up, except an
            exact half goes to the even neighbor. 2.45 → 2.4 but 2.55 → 2.6.
          </li>
          <li>
            <strong>Always up (ceiling):</strong> toward positive infinity. 2.41 →
            2.5 and −2.49 → −2.4.
          </li>
          <li>
            <strong>Always down (floor):</strong> toward negative infinity. 2.49 →
            2.4 and −2.41 → −2.5.
          </li>
        </ul>
        <p>
          Example: round 1,234.5678 to 2 decimal places. The digits after the
          hundredths place are 78, which is more than half of 100, so half up and
          half even both give 1,234.57. Always up also gives 1,234.57, and always
          down gives 1,234.56.
        </p>
        <p>
          Dividing first? The{" "}
          <Link className="text-mint underline" href="/math/long-division-calculator">
            long division calculator
          </Link>{" "}
          shows every step and the decimal answer to round. For very large or very
          small numbers, use the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
          </Link>
          , raise numbers to a power with the{" "}
          <Link className="text-mint underline" href="/math/exponent-calculator">
            exponent calculator
          </Link>
          , or browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the rounding calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type the number you want to round. Commas, minus signs and E notation like 1.5e3 are fine.</li>
          <li>Choose decimal places and enter how many, or pick the nearest whole number, 10, 100 or 1,000.</li>
          <li>Pick a rounding mode: half up, half even, always up or always down.</li>
          <li>Read the rounded answer, the steps, and how every other mode would round the same number.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
