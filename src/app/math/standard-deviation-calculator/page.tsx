import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { StandardDeviationCalculator } from "@/components/tools/StandardDeviationCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/standard-deviation-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Standard Deviation Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is standard deviation?",
    answer:
      "Standard deviation measures how spread out a set of numbers is around its mean. A small standard deviation means the values sit close to the average; a large one means they are spread far apart. It is the square root of the variance.",
  },
  {
    question: "How do I calculate standard deviation by hand?",
    answer:
      "Find the mean, subtract the mean from each value, square each difference, and add the squares. Divide that sum by N for a population (or by n − 1 for a sample) to get the variance, then take the square root. For 2, 4, 4, 4, 5, 5, 7, 9 the mean is 5, the sum of squares is 32, and the population standard deviation is √(32 / 8) = 2.",
  },
  {
    question: "What is the difference between sample and population standard deviation?",
    answer:
      "Use population standard deviation (σ) when your list includes every member of the group you care about, and divide by N. Use sample standard deviation (s) when your list is a sample drawn from a larger group, and divide by n − 1. The sample version is slightly larger to correct for estimating the mean from the same data.",
  },
  {
    question: "Why does sample standard deviation divide by n − 1?",
    answer:
      "Dividing by n − 1 (Bessel's correction) removes the bias that comes from using the sample mean instead of the true population mean. Without it, a sample would tend to underestimate the real spread.",
  },
  {
    question: "What is variance and how is it related to standard deviation?",
    answer:
      "Variance is the average of the squared deviations from the mean. Standard deviation is the square root of variance, which puts the spread back into the same units as the original data. This calculator shows both for population and sample.",
  },
  {
    question: "How do I enter numbers into the standard deviation calculator?",
    answer:
      "Type or paste your numbers separated by commas, spaces, semicolons, or new lines. Negative numbers and decimals are fine, so you can paste a column straight from a spreadsheet. Any entry that is not a number is flagged.",
  },
  {
    question: "Can standard deviation be negative or zero?",
    answer:
      "Standard deviation is never negative because it is the square root of a sum of squares. It is zero only when every value in the list is the same. A single number has a population standard deviation of 0 and no sample standard deviation, since n − 1 would be 0.",
  },
  {
    question: "Is my data saved or uploaded?",
    answer:
      "No. The standard deviation calculator runs entirely in your browser. Your numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Standard Deviation Calculator — Sample & Population",
  description:
    "Free standard deviation calculator. Paste a list of numbers to get sample and population standard deviation, variance, mean, sum, and count with step-by-step work. Runs in your browser.",
  alternates: { canonical: href },
};

export default function StandardDeviationCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Standard Deviation Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Paste a list of numbers to find the sample and population standard
        deviation, variance, mean, sum, and count, with every step shown.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Sample &amp; population</li>
        <li className="chip inline-flex">Variance &amp; mean</li>
        <li className="chip inline-flex">Step-by-step work</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <StandardDeviationCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Standard deviation is the square root of the average squared distance
          from the mean. For a population of N values, σ = √(Σ(x − μ)² / N). For
          a sample of n values, s = √(Σ(x − x̄)² / (n − 1)). The calculator shows
          both so you can pick the one that matches your data.
        </p>
        <p>
          Example: for 2, 4, 4, 4, 5, 5, 7, 9 the count is 8, the sum is 40, and
          the mean is 5. The squared deviations add up to 32, so the population
          variance is 32 / 8 = 4 and σ = 2. The sample variance is 32 / 7 ≈
          4.5714 and s ≈ 2.1381.
        </p>
        <p>
          Find the slope between two points with the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          , break a number into primes with the{" "}
          <Link className="text-mint underline" href="/math/factoring-calculator">
            factoring calculator
          </Link>
          , find the greatest common factor with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
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
          How to use the standard deviation calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type or paste your numbers, separated by commas, spaces, or new lines.</li>
          <li>Read the sample and population standard deviation in the result panel.</li>
          <li>Check the count, sum, mean, and both variances.</li>
          <li>Follow the step-by-step work to see each squared deviation and how the totals were found.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
