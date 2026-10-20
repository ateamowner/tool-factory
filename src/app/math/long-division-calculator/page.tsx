import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { LongDivisionCalculator } from "@/components/tools/LongDivisionCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/long-division-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Long Division Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do you do long division step by step?",
    answer:
      "Work left to right through the dividend. Bring down the next digit, see how many times the divisor fits into that number, write that digit in the quotient, multiply it by the divisor, and subtract. The difference is the remainder you carry into the next step. Repeat until every digit has been brought down.",
  },
  {
    question: "What are the dividend, divisor, quotient, and remainder?",
    answer:
      "The dividend is the number being divided, the divisor is the number you divide by, the quotient is the answer, and the remainder is what is left over. In 435 ÷ 25, 435 is the dividend, 25 is the divisor, 17 is the quotient, and 10 is the remainder.",
  },
  {
    question: "How do I write a long division answer with a remainder?",
    answer:
      "Write the quotient, then R, then the remainder: 435 ÷ 25 = 17 R 10. You can check it by multiplying the quotient by the divisor and adding the remainder: 17 × 25 + 10 = 435.",
  },
  {
    question: "How do I turn the remainder into a decimal?",
    answer:
      "Put a decimal point after the quotient, add a zero to the remainder, and keep dividing. In 435 ÷ 25 the remainder 10 becomes 100, and 100 ÷ 25 = 4, so the answer is 17.4. Set the decimal places box to choose how far the calculator goes.",
  },
  {
    question: "What is a repeating decimal in long division?",
    answer:
      "If a remainder shows up again, the digits after it will repeat forever. For example, 1 ÷ 3 = 0.333… and 22 ÷ 7 = 3.142857142857…. The calculator spots the repeat and tells you which digits keep repeating.",
  },
  {
    question: "Can I do long division with decimals?",
    answer:
      "Yes. Multiply the dividend and divisor by the same power of 10 so the divisor is a whole number, then divide as usual. 7.5 ÷ 2.5 becomes 75 ÷ 25 = 3. The calculator does this shift for you and shows it as the first step.",
  },
  {
    question: "What happens with negative numbers or dividing by zero?",
    answer:
      "Divide the numbers without their signs, then make the answer negative if exactly one of them is negative, so −84 ÷ 4 = −21. Dividing by zero is undefined, so the calculator asks for a divisor other than 0.",
  },
  {
    question: "How do I check my long division answer?",
    answer:
      "Multiply the quotient by the divisor and add the remainder. If you get the dividend back, the division is right. For a decimal answer, multiply the decimal by the divisor and you should land on (or very close to) the dividend.",
  },
];

export const metadata: Metadata = {
  title: "Long Division Calculator — Steps, Remainders & Decimals",
  description:
    "Free long division calculator that shows the work step by step. Get the quotient and remainder, the decimal answer, and repeating decimals. Works with decimals and negatives.",
  alternates: { canonical: href },
};

export default function LongDivisionCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Long Division Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Divide any two numbers the long way and see every step: bring down,
        divide, multiply, and subtract. Get the quotient with its remainder, the
        decimal answer to the places you choose, and a flag when the decimal
        repeats. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Step-by-step work</li>
        <li className="chip inline-flex">Quotient and remainder</li>
        <li className="chip inline-flex">Decimals and repeating decimals</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <LongDivisionCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Long division breaks a big division problem into small ones. Each step
          brings down one digit of the dividend, asks how many times the divisor
          fits, multiplies, and subtracts. Whatever is left is carried into the
          next step. When the digits run out, the last difference is the
          remainder, and you can keep going past a decimal point by bringing down
          zeros.
        </p>
        <p>
          Example: 435 ÷ 25. 25 doesn&apos;t fit into 4, so the first quotient digit
          is 0. Bring down 3 to make 43; 25 fits once, and 43 − 25 = 18. Bring down
          5 to make 185; 25 fits 7 times, and 185 − 175 = 10. The answer is 17 R
          10, or 17.4 as a decimal.
        </p>
        <p>
          Need a share of a total instead? The{" "}
          <Link className="text-mint underline" href="/math/percentage-calculator">
            percentage calculator
          </Link>{" "}
          finds X% of Y, part-to-whole percents, and percent change. Find the
          greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , break a number into primes with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , simplify a ratio with the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          , or solve A / B = C / D with the{" "}
          <Link className="text-mint underline" href="/math/proportion-calculator">
            proportion calculator
          </Link>
          . Browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the long division calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the dividend, the number you want to divide.</li>
          <li>Enter the divisor, the number you are dividing by. Decimals, negatives, and commas are fine.</li>
          <li>Choose how many decimal places to work out after the remainder (0 for a whole-number answer).</li>
          <li>Read the quotient, remainder, and decimal answer, then follow each step of the work.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
