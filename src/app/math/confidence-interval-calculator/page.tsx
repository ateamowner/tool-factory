import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { ConfidenceIntervalCalculator } from "@/components/tools/ConfidenceIntervalCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/confidence-interval-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Confidence Interval Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a confidence interval?",
    answer:
      "A confidence interval is a range of values built from sample data that is likely to contain the true population value. A 95% confidence interval means that if you repeated the study many times, about 95% of the intervals built this way would contain the true mean or proportion.",
  },
  {
    question: "How do I calculate a confidence interval for a mean?",
    answer:
      "Compute the standard error s / √n, multiply it by the critical value for your confidence level to get the margin of error, then add and subtract that margin from the sample mean. With a mean of 50, s = 10 and n = 25 at 95%, the t critical value is 2.064, the margin of error is 4.13, and the interval is (45.87, 54.13).",
  },
  {
    question: "Should I use a z or a t interval?",
    answer:
      "Use a z interval when the population standard deviation σ is known. Use a t interval when you only have the sample standard deviation s, which is the usual case. The t interval is wider for small samples and approaches the z interval as n grows.",
  },
  {
    question: "What are the critical values for 90%, 95% and 99% confidence?",
    answer:
      "For z, the critical values are 1.645 for 90%, 1.960 for 95% and 2.576 for 99%. For t, the value depends on the degrees of freedom (n − 1). For example, with 24 degrees of freedom the 95% t value is 2.064.",
  },
  {
    question: "How do I find a confidence interval for a proportion?",
    answer:
      "Find p̂ = x / n, then the margin of error is z × √(p̂(1 − p̂) / n). With 60 successes out of 100 at 95%, p̂ is 0.60, the margin of error is 9.6%, and the interval is about 50.4% to 69.6%. This calculator also shows the Wilson interval, which is more reliable for small samples.",
  },
  {
    question: "What is the margin of error?",
    answer:
      "The margin of error is half the width of the confidence interval: the critical value times the standard error. It is the plus-or-minus figure you see in poll results. A larger sample or a lower confidence level makes it smaller.",
  },
  {
    question: "What does a 95% confidence level really mean?",
    answer:
      "It describes the method, not one interval. It does not mean there is a 95% chance that the true value lies in the one interval you computed. It means the procedure captures the true value in about 95% of repeated samples.",
  },
  {
    question: "How does sample size change the interval?",
    answer:
      "The margin of error shrinks with the square root of n. To cut the margin of error in half you need about four times as many observations. A higher confidence level makes the interval wider.",
  },
  {
    question: "Is my data saved or uploaded?",
    answer:
      "No. The confidence interval calculator runs entirely in your browser. Your numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Confidence Interval Calculator — Mean & Proportion, 90/95/99%",
  description:
    "Free confidence interval calculator for a mean (z or t) and a proportion. Choose 90%, 95%, 99% or a custom level and see the margin of error, critical value and interval. Runs in your browser.",
  alternates: { canonical: href },
};

export default function ConfidenceIntervalCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Confidence Interval Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find a confidence interval for a population mean or a proportion. Enter
        your sample statistics, pick 90%, 95%, 99% or a custom confidence level,
        and this confidence interval calculator returns the interval, the margin
        of error, the standard error and the critical value. Everything runs in
        the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Mean (z or t)</li>
        <li className="chip inline-flex">Proportion with Wilson</li>
        <li className="chip inline-flex">90 / 95 / 99% presets</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <ConfidenceIntervalCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">Confidence interval formulas</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-7">
          <li>Mean, σ known: x̄ ± z × σ / √n</li>
          <li>Mean, σ unknown: x̄ ± t × s / √n, with n − 1 degrees of freedom</li>
          <li>Proportion: p̂ ± z × √(p̂(1 − p̂) / n)</li>
          <li>Margin of error: critical value × standard error</li>
        </ul>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Worked example</h2>
        <p>
          A sample of 25 widgets has a mean weight of 50 g and a sample standard
          deviation of 10 g. The standard error is 10 / √25 = 2. The 95% t
          critical value with 24 degrees of freedom is 2.064, so the margin of
          error is 4.13 g and the 95% confidence interval is 45.87 g to 54.13 g.
          Switching to 99% widens it to about 44.3 g to 55.7 g.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Related statistics tools</h2>
        <p>
          Need the sample standard deviation first? Use the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>
          . To test a claim instead of estimating a range, the{" "}
          <Link className="text-mint underline" href="/math/p-value-calculator">
            p-value calculator
          </Link>{" "}
          turns a z, t or chi-square statistic into a p-value. For the spread of a data set and outliers, try the{" "}
          <Link className="text-mint underline" href="/math/iqr-calculator">
            IQR calculator
          </Link>
          , and for a quick average use the{" "}
          <Link className="text-mint underline" href="/math/mean-median-mode-calculator">
            mean median mode calculator
          </Link>
          .
        </p>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
