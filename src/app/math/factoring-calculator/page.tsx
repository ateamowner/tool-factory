import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { FactoringCalculator } from "@/components/tools/FactoringCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/factoring-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Factoring Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is factoring?",
    answer:
      "Factoring a whole number means writing it as a product of smaller whole numbers that multiply to the original. The complete form is the prime factorization, where every factor is a prime. For example, 60 factors as 2 × 2 × 3 × 5, or 2^2 × 3 × 5.",
  },
  {
    question: "How does prime factorization work?",
    answer:
      "Divide the number by the smallest prime that goes into it evenly, then repeat with the quotient until only primes remain. For 360: divide by 2 three times to get 45, then by 3 twice to get 5, so 360 = 2^3 × 3^2 × 5.",
  },
  {
    question: "How do I find all factors of a number?",
    answer:
      "Every positive factor comes in pairs that multiply to the number. For 12, the pairs are 1 × 12, 2 × 6, and 3 × 4, so the factors are 1, 2, 3, 4, 6, and 12. This calculator lists them all in ascending order and shows the count.",
  },
  {
    question: "What is the difference between factors and multiples?",
    answer:
      "A factor of n divides n evenly (12 is a factor of 60). A multiple of n is n times a whole number (60 is a multiple of 12). Factors are usually smaller than or equal to the number; multiples go on forever.",
  },
  {
    question: "What is the difference between prime and composite numbers?",
    answer:
      "A prime number has exactly two positive factors: 1 and itself (examples: 2, 3, 5, 97). A composite number has more than two factors (examples: 4, 9, 360). The number 1 is neither prime nor composite.",
  },
  {
    question: "How does factoring relate to the GCF?",
    answer:
      "The greatest common factor of two or more numbers is built from the primes they share. Once you know the prime factorization of each number, multiply the shared primes at their lowest powers to get the GCF. Use the GCF calculator when you have a list of numbers instead of one.",
  },
  {
    question: "Can you walk through an example?",
    answer:
      "Take 84. Divide by 2 to get 42, by 2 again to get 21, then by 3 to get 7. So 84 = 2^2 × 3 × 7. The positive factors are 1, 2, 3, 4, 6, 7, 12, 14, 21, 28, 42, and 84 — twelve factors — and 84 is composite.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The factoring calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Factoring Calculator — Prime Factorization & All Factors",
  description:
    "Free factoring calculator. Find the prime factorization of a whole number, list every positive factor, see the factor count, and tell whether the number is prime or composite. Runs in your browser.",
  alternates: { canonical: href },
};

export default function FactoringCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Factoring Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Factor a whole number into primes, list every positive factor, and see
        whether it is prime or composite. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Prime factorization</li>
        <li className="chip inline-flex">All positive factors</li>
        <li className="chip inline-flex">Prime or composite</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <FactoringCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Factoring answers two related questions: which primes multiply to make
          this number, and which whole numbers divide it evenly. The prime
          factorization is unique (up to order), so 360 is always 2^3 × 3^2 × 5
          no matter how you start.
        </p>
        <p>
          Example: 84 = 2^2 × 3 × 7. Pairing factors that multiply to 84 gives
          1 and 84, 2 and 42, 3 and 28, 4 and 21, 6 and 14, and 7 and 12 — twelve
          positive factors in all. Because there are more than two, 84 is
          composite.
        </p>
        <p>
          Find the greatest common factor of several numbers with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>
          , simplify a ratio with the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          , solve A / B = C / D with the{" "}
          <Link className="text-mint underline" href="/math/proportion-calculator">
            proportion calculator
          </Link>
          , find the slope between two points with the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , measure the spread of a data set with the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>
          , or find a percent of a number or percent change with the{" "}
          <Link className="text-mint underline" href="/math/percentage-calculator">
            percentage calculator
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
          How to use the factoring calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type a positive whole number (1 up to 1,000,000,000,000).</li>
          <li>Read the prime factorization written with × and exponents.</li>
          <li>Scan the full list of positive factors and the factor count.</li>
          <li>Check whether the number is prime, composite, or 1.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
