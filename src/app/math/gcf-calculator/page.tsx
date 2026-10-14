import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { GcfCalculator } from "@/components/tools/GcfCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/gcf-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "GCF Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is the GCF?",
    answer:
      "The greatest common factor (GCF) is the largest whole number that divides every number in a set with no remainder. The GCF of 12 and 18 is 6, because 6 divides both and no larger number does.",
  },
  {
    question: "How do I find the GCF of two numbers?",
    answer:
      "List the factors of each number and pick the largest one they share, or use prime factorization. 12 = 2 × 2 × 3 and 18 = 2 × 3 × 3 share one 2 and one 3, so the GCF is 2 × 3 = 6.",
  },
  {
    question: "How does the Euclidean algorithm find the GCF?",
    answer:
      "Divide the larger number by the smaller one, then replace the larger number with the remainder and repeat until the remainder is 0. The last non-zero remainder is the GCF. For 48 and 18: 48 = 2 × 18 + 12, 18 = 1 × 12 + 6, 12 = 2 × 6 + 0, so the GCF is 6.",
  },
  {
    question: "Can I find the GCF of three or more numbers?",
    answer:
      "Yes. Find the GCF of the first two numbers, then the GCF of that result and the next number, and so on. The GCF of 24, 36, and 60 is 12. This calculator takes up to 20 numbers at once.",
  },
  {
    question: "Are GCF, GCD, and HCF the same thing?",
    answer:
      "Yes. Greatest common factor (GCF), greatest common divisor (GCD), and highest common factor (HCF) are three names for the same number.",
  },
  {
    question: "What is the difference between GCF and LCM?",
    answer:
      "The GCF is the largest number that divides all of your numbers. The least common multiple (LCM) is the smallest number that all of them divide into. For 12 and 18 the GCF is 6 and the LCM is 36. For two numbers, GCF × LCM equals the product of the numbers.",
  },
  {
    question: "What does it mean if the GCF is 1?",
    answer:
      "If the GCF is 1, the numbers are relatively prime (coprime): they share no factor other than 1. 8 and 15 are relatively prime even though neither is a prime number.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The GCF calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "GCF Calculator — Greatest Common Factor with Steps",
  description:
    "Free GCF calculator. Find the greatest common factor (GCD/HCF) of 2 to 20 numbers with prime factorization, Euclidean algorithm steps, common factors, and the LCM. Runs in your browser.",
  alternates: { canonical: href },
};

export default function GcfCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">GCF Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the greatest common factor of two or more whole numbers. See the
        prime factorization, the Euclidean algorithm steps, every common
        factor, and the least common multiple. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">2 to 20 numbers</li>
        <li className="chip inline-flex">Prime factorization</li>
        <li className="chip inline-flex">Euclidean steps &amp; LCM</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <GcfCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          The greatest common factor is the biggest number that divides every
          number in your list evenly. It is the number you divide by to reduce
          a fraction or a ratio to lowest terms: 18 / 24 shares a GCF of 6, so
          it reduces to 3 / 4.
        </p>
        <p>
          Example: 24 = 2^3 × 3, 36 = 2^2 × 3^2, and 60 = 2^2 × 3 × 5. The
          primes all three share, at their lowest power, are 2^2 and 3, so the
          GCF is 4 × 3 = 12.
        </p>
        <p>
          Reduce a ratio with the{" "}
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
          How to use the GCF calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type two or more whole numbers, separated by commas or spaces.</li>
          <li>Read the GCF, the LCM, and whether the numbers are relatively prime.</li>
          <li>Check the prime factorization of each number to see the shared primes.</li>
          <li>Follow the Euclidean algorithm steps to see how the GCF was found.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
