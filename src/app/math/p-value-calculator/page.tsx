import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { PValueCalculator } from "@/components/tools/PValueCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/p-value-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "P-Value Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a p-value?",
    answer:
      "A p-value is the probability of getting a result at least as extreme as the one you observed, assuming the null hypothesis is true. A small p-value means your data would be unlikely if the null hypothesis were true, which is evidence against it. It is not the probability that the null hypothesis is true.",
  },
  {
    question: "How do I calculate a p-value from a z score?",
    answer:
      "Pick the Z-test, enter your z score, choose a tail, and the p-value updates instantly. For a right-tailed test it is P(Z > z), for a left-tailed test P(Z < z), and for a two-tailed test it is 2 × P(Z > |z|). For z = 1.96 the two-tailed p-value is about 0.05.",
  },
  {
    question: "How do I find the p-value from a t score?",
    answer:
      "Choose the T-test, enter the t score and the degrees of freedom (for a one-sample t-test, df = n − 1). The calculator uses the Student t distribution. For t = 2 with 20 degrees of freedom, the right-tailed p-value is about 0.0296 and the two-tailed p-value is about 0.0593.",
  },
  {
    question: "How do I get a p-value from a chi-square statistic?",
    answer:
      "Choose Chi-square, enter the statistic and its degrees of freedom. Chi-square tests for goodness of fit and independence are almost always right-tailed, so the p-value is P(χ² > statistic). For χ² = 3.841 with 1 degree of freedom, p is about 0.05.",
  },
  {
    question: "What is the difference between a one-tailed and a two-tailed test?",
    answer:
      "A one-tailed test checks for an effect in one direction only (greater than or less than), so all of alpha sits in one tail. A two-tailed test checks for a difference in either direction and splits alpha between both tails. For symmetric distributions like z and t, the two-tailed p-value is twice the one-tailed p-value.",
  },
  {
    question: "How do I know if my p-value is statistically significant?",
    answer:
      "Compare it with your significance level alpha, usually 0.05. If p < alpha, reject the null hypothesis and call the result statistically significant. If p ≥ alpha, fail to reject it. The calculator does this check for you and shows the critical value or values for your alpha.",
  },
  {
    question: "What does a p-value of 0.05 mean?",
    answer:
      "It means that if the null hypothesis were true, you would see a result this extreme or more extreme about 5% of the time. A result at exactly p = 0.05 is on the edge of the usual cutoff, so the decision depends on whether you require p < 0.05 or p ≤ 0.05. Always set alpha before you look at the data.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The p-value calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "P-Value Calculator — Z, T & Chi-Square, One- or Two-Tailed",
  description:
    "Free p-value calculator. Get the p-value from a z score, t score or chi-square statistic, one-tailed or two-tailed, and check significance against alpha with critical values. Runs in your browser.",
  alternates: { canonical: href },
};

export default function PValueCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">P-Value Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the p-value from a z score, t score or chi-square statistic. Choose
        a one-tailed or two-tailed test, set your significance level alpha, and
        see right away whether the result is statistically significant.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Z-test</li>
        <li className="chip inline-flex">T-test</li>
        <li className="chip inline-flex">Chi-square</li>
        <li className="chip inline-flex">One- and two-tailed</li>
        <li className="chip inline-flex">Alpha check</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <PValueCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">P-value from a z score, t score or chi-square</h2>
        <p>
          The p-value measures how surprising your test statistic is if the null
          hypothesis is true. Use the z-test when the population standard
          deviation is known or the sample is large, the t-test for small
          samples with an estimated standard deviation, and chi-square for
          goodness of fit, independence and variance tests.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">One-tailed vs two-tailed p-values</h2>
        <p>
          Right-tailed: p = P(statistic ≥ observed). Left-tailed: p =
          P(statistic ≤ observed). Two-tailed for z and t: p = 2 × the smaller
          tail. Example: z = 1.96 gives a two-tailed p of 0.05 and a
          right-tailed p of 0.025.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Significance check against alpha</h2>
        <p>
          If p is less than alpha, reject the null hypothesis. The calculator
          also shows the critical value or values for your alpha, so you can
          compare the statistic directly. To get the z score or t score in the
          first place, you need the mean and spread of your data. Find them
          with the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>{" "}
          and the{" "}
          <Link className="text-mint underline" href="/math/mean-median-mode-calculator">
            mean median mode calculator
          </Link>
          , estimate a range for a mean or proportion with the{" "}
          <Link className="text-mint underline" href="/math/confidence-interval-calculator">
            confidence interval calculator
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
          How to use the p-value calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick the test: Z-test, T-test or Chi-square.</li>
          <li>Choose two-tailed, right-tailed or left-tailed.</li>
          <li>Enter your test statistic and, for t and chi-square, the degrees of freedom.</li>
          <li>Set alpha (0.05 is common), then read the p-value and the significance decision.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
