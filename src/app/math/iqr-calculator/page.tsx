import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { IqrCalculator } from "@/components/tools/IqrCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/iqr-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "IQR Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is the interquartile range (IQR)?",
    answer:
      "The interquartile range is the spread of the middle half of your data: IQR = Q3 − Q1. Q1 is the 25th percentile and Q3 is the 75th percentile. Because it ignores the lowest and highest quarters, extreme values barely change it.",
  },
  {
    question: "How do I use this IQR calculator?",
    answer:
      "Paste or type your numbers, separated by commas, spaces or new lines. The calculator sorts them and shows Q1, the median (Q2), Q3, the IQR, the five-number summary and any outliers. It updates as you type.",
  },
  {
    question: "How does this quartile calculator find Q1 and Q3?",
    answer:
      "By default it uses the exclusive method, which places a quartile at position (n + 1) × p in the sorted list and interpolates between neighbors if needed. Switch to the inclusive method to use position 1 + (n − 1) × p, which matches Excel QUARTILE.INC. Both are standard, and they can differ slightly on small data sets.",
  },
  {
    question: "What is the difference between the exclusive and inclusive quartile methods?",
    answer:
      "The exclusive method treats your numbers as a sample from a larger population, so its quartiles can land farther toward the ends. The inclusive method treats the minimum and maximum as the 0th and 100th percentiles. For 1 through 10, exclusive gives Q1 = 2.75 and Q3 = 8.25, while inclusive gives Q1 = 3.25 and Q3 = 7.75.",
  },
  {
    question: "How do I find outliers with the 1.5 × IQR rule?",
    answer:
      "Compute the fences: lower fence = Q1 − 1.5 × IQR and upper fence = Q3 + 1.5 × IQR. Any value below the lower fence or above the upper fence is flagged as an outlier. The calculator shows both fences and lists the outliers.",
  },
  {
    question: "What is the five-number summary?",
    answer:
      "It is the minimum, Q1, the median, Q3 and the maximum. Together they describe the center, spread and range of your data, and they are exactly the values drawn in a box plot.",
  },
  {
    question: "Is a bigger IQR better or worse?",
    answer:
      "Neither. A bigger IQR means the middle half of the data is more spread out, and a smaller IQR means it is tightly clustered. Use it to compare variability between data sets measured in the same units.",
  },
  {
    question: "Is my data saved or uploaded?",
    answer:
      "No. The IQR calculator runs entirely in your browser. Your numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "IQR Calculator — Interquartile Range, Quartiles & Outliers",
  description:
    "Free IQR calculator and quartile calculator. Paste your numbers to get Q1, median, Q3, the interquartile range, the five-number summary and outliers by the 1.5 × IQR rule. Runs in your browser.",
  alternates: { canonical: href },
};

export default function IqrCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">IQR Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the interquartile range of any list of numbers. This IQR calculator
        and quartile calculator gives you Q1, the median, Q3, the five-number
        summary and the outliers from the 1.5 × IQR rule. Pick the exclusive or
        inclusive quartile method. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Q1, Q2, Q3</li>
        <li className="chip inline-flex">Five-number summary</li>
        <li className="chip inline-flex">Outlier fences</li>
        <li className="chip inline-flex">Exclusive and inclusive</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <IqrCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">How to find the interquartile range</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Sort the numbers from smallest to largest.</li>
          <li>Find the median (Q2), then Q1 and Q3, the medians of the lower and upper parts.</li>
          <li>Subtract: IQR = Q3 − Q1.</li>
          <li>Optional: set the fences at Q1 − 1.5 × IQR and Q3 + 1.5 × IQR to spot outliers.</li>
        </ol>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Quartile method used</h2>
        <p>
          Quartiles are not defined the same way everywhere. The default here is
          the exclusive method, position (n + 1) × p, which matches Excel
          QUARTILE.EXC and many textbooks. The inclusive method, position 1 +
          (n − 1) × p, matches Excel QUARTILE.INC. Example: for 1 to 10 the
          exclusive IQR is 8.25 − 2.75 = 5.5 and the inclusive IQR is 7.75 −
          3.25 = 4.5.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Outliers and the five-number summary</h2>
        <p>
          A value more than 1.5 × IQR below Q1 or above Q3 is flagged as an
          outlier. For 1, 2, 3, 4, 5, 6, 7, 8, 9 and 50, Q1 is 2.75, Q3 is 8.25
          and the IQR is 5.5, so the upper fence is 16.5 and 50 is an outlier.
          Pair this with the{" "}
          <Link className="text-mint underline" href="/math/mean-median-mode-calculator">
            mean median mode calculator
          </Link>{" "}
          for the center of your data and the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>{" "}
          for spread around the mean.
        </p>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
