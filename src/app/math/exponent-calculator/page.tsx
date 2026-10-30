import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ExponentCalculator } from "@/components/tools/ExponentCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/exponent-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Exponent Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is an exponent?",
    answer:
      "An exponent tells you how many times to multiply a number, called the base, by itself. In 2⁵ the base is 2 and the exponent is 5, so 2⁵ = 2 × 2 × 2 × 2 × 2 = 32. It is also called a power, so 2⁵ is read “2 to the 5th power.”",
  },
  {
    question: "How do negative exponents work?",
    answer:
      "A negative exponent means take the reciprocal. b⁻ⁿ = 1 / bⁿ, so 2⁻³ = 1 / 2³ = 1/8 = 0.125 and 10⁻² = 0.01. A negative exponent makes the answer smaller; it does not make it negative.",
  },
  {
    question: "How do fractional exponents work?",
    answer:
      "A fractional exponent is a root. b^(1/n) is the nth root of b, so 16^(1/2) = √16 = 4 and 27^(1/3) = ∛27 = 3. For b^(m/n), take the nth root and then raise it to the m power: 8^(2/3) = (∛8)² = 2² = 4. Decimal exponents work the same way, since 0.5 = 1/2.",
  },
  {
    question: "What is any number to the power of 0?",
    answer:
      "Any nonzero number to the power 0 equals 1, so 5⁰ = 1 and (−3)⁰ = 1. That follows from the rule bⁿ ÷ bⁿ = bⁿ⁻ⁿ = b⁰ = 1. The case 0⁰ is usually defined as 1 in algebra and by calculators.",
  },
  {
    question: "Can a negative number have a fractional exponent?",
    answer:
      "Sometimes. If the fraction has an odd denominator, like 1/3, the answer is real: (−8)^(1/3) = −2. If the denominator is even, like 1/2, there is no real answer, because no real number squared is negative. (−4)^(1/2) is the complex number 2i, and the calculator tells you when that happens.",
  },
  {
    question: "How do I solve for a missing exponent?",
    answer:
      "Use logarithms. If bˣ = r, then x = log(r) / log(b). For 2ˣ = 1024, x = log 1024 / log 2 = 10. Choose “Solve for the exponent,” enter the base and the result, and the calculator does the division for you.",
  },
  {
    question: "How do I solve for a missing base?",
    answer:
      "Take the nth root of the result. If xⁿ = r, then x = r^(1/n). For x⁴ = 81, x = 81^(1/4) = 3. With an even exponent, −3 also works, so the full answer is x = ±3. Choose “Solve for the base” and enter the result and the exponent.",
  },
  {
    question: "Why are some answers shown in scientific notation?",
    answer:
      "Powers grow very fast. 2¹⁰⁰ has 31 digits and 10^500 is far larger than a normal calculator can store. Very large or very small answers are shown in scientific notation, like 1.2676506 × 10³⁰, and in E notation. Everything runs in your browser and nothing is uploaded.",
  },
];

export const metadata: Metadata = {
  title: "Exponent Calculator — Powers, Negative & Fractional Exponents",
  description:
    "Free exponent calculator. Raise any number to a power, including negative, decimal and fractional exponents, see very large answers in scientific notation, and solve for a missing base or exponent with steps.",
  alternates: { canonical: href },
};

export default function ExponentCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Exponent Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Raise any number to any power, like 2¹⁰ = 1,024. Use negative exponents,
        decimals and fractions such as 8^(2/3), see huge or tiny answers in
        scientific and E notation, and solve for a missing base or exponent with
        steps. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Negative & fractional exponents</li>
        <li className="chip inline-flex">Scientific notation</li>
        <li className="chip inline-flex">Solve for base or exponent</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <ExponentCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An exponent says how many times to multiply the base by itself: bⁿ = b ×
          b × … × b, n times. The main rules are bᵐ × bⁿ = bᵐ⁺ⁿ, bᵐ ÷ bⁿ = bᵐ⁻ⁿ,
          (bᵐ)ⁿ = bᵐⁿ, b⁰ = 1, b⁻ⁿ = 1 / bⁿ, and b^(1/n) = the nth root of b.
        </p>
        <p>
          Example: 8^(−2/3). The denominator 3 means a cube root, so ∛8 = 2. The
          numerator 2 means square it, 2² = 4. The minus sign means take the
          reciprocal, so 8^(−2/3) = 1/4 = 0.25.
        </p>
        <p>
          Big powers are easier to read in scientific notation. Convert any
          answer with the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
          </Link>
          , find square and cube roots with the{" "}
          <Link className="text-mint underline" href="/math/square-root-calculator">
            square root calculator
          </Link>
          , break numbers into prime powers with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
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
          How to use the exponent calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick “Find the answer,” “Solve for the base,” or “Solve for the exponent.”</li>
          <li>Type the base and exponent. Exponents can be whole numbers, negatives, decimals like 0.5, or fractions like 2/3.</li>
          <li>Read the answer, its scientific and E notation, and the steps.</li>
          <li>For very large or very small answers, use the scientific notation shown in the result panel.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
