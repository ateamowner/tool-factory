import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { LcmCalculator } from "@/components/tools/LcmCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/lcm-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "LCM Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is the LCM?",
    answer:
      "The least common multiple (LCM) is the smallest positive number that every number in a set divides into with no remainder. The LCM of 4 and 6 is 12, because 12 is the first number that both 4 and 6 go into evenly.",
  },
  {
    question: "How do I find the LCM of two numbers?",
    answer:
      "List the multiples of each number until you find the first one they share, or use the formula LCM(a, b) = a × b ÷ GCF(a, b). For 12 and 18 the GCF is 6, so the LCM is 12 × 18 ÷ 6 = 36.",
  },
  {
    question: "How do I find the LCM with prime factorization?",
    answer:
      "Break each number into primes, then take every prime at the highest power it appears in any of the numbers and multiply. 8 = 2^3, 12 = 2^2 × 3, and 18 = 2 × 3^2, so the LCM is 2^3 × 3^2 = 72.",
  },
  {
    question: "Can I find the LCM of three or more numbers?",
    answer:
      "Yes. Find the LCM of the first two numbers, then the LCM of that result and the next number, and so on. The LCM of 4, 6, and 10 is 60. This calculator takes up to 20 numbers at once.",
  },
  {
    question: "What is the difference between LCM and GCF?",
    answer:
      "The LCM is the smallest number that all of your numbers divide into. The greatest common factor (GCF) is the largest number that divides all of them. For 12 and 18 the LCM is 36 and the GCF is 6. For two numbers, LCM × GCF equals the product of the numbers.",
  },
  {
    question: "How is the LCM used with fractions?",
    answer:
      "The LCM of the denominators is the least common denominator. To add 1/4 + 1/6, the LCM of 4 and 6 is 12, so rewrite them as 3/12 + 2/12 = 5/12.",
  },
  {
    question: "What is the LCM of two prime or coprime numbers?",
    answer:
      "If two numbers share no factor other than 1, their LCM is simply their product. The LCM of 7 and 11 is 77, and the LCM of 8 and 15 is 120.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The LCM calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "LCM Calculator — Least Common Multiple with Steps",
  description:
    "Free LCM calculator. Find the least common multiple of 2 to 20 numbers with prime factorization, the GCF method, and listing multiples, step by step. Runs in your browser.",
  alternates: { canonical: href },
};

export default function LcmCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">LCM Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the least common multiple of two or more whole numbers. See the
        prime factorization, the highest power of each prime, the GCF method
        steps, and the listed multiples. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">2 to 20 numbers</li>
        <li className="chip inline-flex">Prime factorization</li>
        <li className="chip inline-flex">Step-by-step work</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <LcmCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          The least common multiple is the smallest number that every number in
          your list divides into evenly. It is the number you need to add or
          subtract fractions with different denominators, and it answers
          questions like when two repeating schedules will line up again.
        </p>
        <p>
          Example: 4 = 2^2, 6 = 2 × 3, and 10 = 2 × 5. The highest power of
          each prime is 2^2, 3, and 5, so the LCM is 4 × 3 × 5 = 60.
        </p>
        <p>
          Find the largest shared factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , break one number into primes with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , reduce a ratio with the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          , divide step by step with the{" "}
          <Link className="text-mint underline" href="/math/long-division-calculator">
            long division calculator
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
          How to use the LCM calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type two or more whole numbers, separated by commas or spaces.</li>
          <li>Read the LCM and the GCF in the result panel.</li>
          <li>Check the prime factorization to see the highest power of each prime.</li>
          <li>Follow the GCF method steps or the listed multiples to see how the LCM was found.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
