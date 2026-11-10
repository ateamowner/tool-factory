import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { MeanMedianModeCalculator } from "@/components/tools/MeanMedianModeCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/mean-median-mode-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Mean Median Mode Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What are mean, median, and mode?",
    answer:
      "The mean is the average: add all the numbers and divide by how many there are. The median is the middle value once the numbers are sorted. The mode is the value that appears most often. Together with the range (largest minus smallest), they describe the center and spread of a data set.",
  },
  {
    question: "How do I calculate the mean, median, and mode by hand?",
    answer:
      "For 3, 7, 7, 2, 9, 4, 7, 1: the sum is 40 and there are 8 values, so the mean is 5. Sorted, the list is 1, 2, 3, 4, 7, 7, 7, 9; the two middle values are 4 and 7, so the median is 5.5. The value 7 appears three times, so the mode is 7. The range is 9 − 1 = 8.",
  },
  {
    question: "How does the median calculator handle an even number of values?",
    answer:
      "When the list has an even count there is no single middle value, so the median is the average of the two middle numbers after sorting. With an odd count it is simply the middle number. This page works as a median calculator: enter your list and read the Median row.",
  },
  {
    question: "Can a data set have more than one mode, or no mode?",
    answer:
      "Yes. If two or more values tie for the highest count, all of them are modes (for example 1, 1, 2, 2, 3 has modes 1 and 2). If every value appears only once, there is no mode. The mode calculator on this page lists every mode or tells you there is none.",
  },
  {
    question: "What is the range, and how is it calculated?",
    answer:
      "The range is the largest value minus the smallest value. It is the simplest measure of spread. This mean median mode range calculator also shows the minimum, maximum, count, sum, and midrange (the average of the minimum and maximum).",
  },
  {
    question: "When should I use the mean, and when the median?",
    answer:
      "The mean uses every value, so a few extreme numbers can pull it up or down. The median ignores how far out the extremes are, so it is usually a better picture of a typical value for skewed data such as incomes or home prices. If the mean and median are far apart, the data is likely skewed.",
  },
  {
    question: "How do I enter numbers into the calculator?",
    answer:
      "Type or paste your numbers separated by commas, spaces, semicolons, or new lines. Negative numbers and decimals are fine, so you can paste a column straight from a spreadsheet. Any entry that is not a number is flagged so you can fix it.",
  },
  {
    question: "Is my data saved or uploaded?",
    answer:
      "No. The mean median mode calculator runs entirely in your browser. Your numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Mean Median Mode Calculator — With Range & Steps",
  description:
    "Free mean, median, mode, and range calculator. Paste a list of numbers to get the average, median, every mode, range, sum, count, min, and max with step-by-step work. Runs in your browser.",
  alternates: { canonical: href },
};

export default function MeanMedianModeCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Mean Median Mode Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Paste a list of numbers to find the mean, median, mode, and range, plus
        the count, sum, minimum, maximum, and midrange, with the work shown.
        Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Mean, median &amp; mode</li>
        <li className="chip inline-flex">Range, min &amp; max</li>
        <li className="chip inline-flex">Multiple modes</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <MeanMedianModeCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">Mean, median, and mode explained</h2>
        <p>
          The mean is the sum divided by the count. The median is the middle
          value of the sorted list, or the average of the two middle values when
          the count is even. The mode is the most frequent value, and a list can
          have one mode, several modes, or none. The range is the maximum minus
          the minimum.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Median calculator and mode calculator</h2>
        <p>
          Need only one of them? Enter your numbers and read the Median or Mode
          row. The calculator sorts the list for you, so you can paste values in
          any order, and it lists every mode when there is a tie.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Mean, median, mode, and range example</h2>
        <p>
          For 3, 7, 7, 2, 9, 4, 7, 1 the sum is 40 across 8 values, so the mean
          is 5. Sorted, the middle values are 4 and 7, so the median is 5.5. The
          value 7 appears three times, so the mode is 7, and the range is 9 − 1 = 8.
        </p>
        <p>
          Measure spread around the mean with the{" "}
          <Link className="text-mint underline" href="/math/standard-deviation-calculator">
            standard deviation calculator
          </Link>
          , work out percentages and percent change with the{" "}
          <Link className="text-mint underline" href="/math/percentage-calculator">
            percentage calculator
          </Link>
          , round your results with the{" "}
          <Link className="text-mint underline" href="/math/rounding-calculator">
            rounding calculator
          </Link>
          , simplify a ratio with the{" "}
          <Link className="text-mint underline" href="/math/ratio-calculator">
            ratio calculator
          </Link>
          , or find the square root of a number with the{" "}
          <Link className="text-mint underline" href="/math/square-root-calculator">
            square root calculator
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
          How to use the mean median mode calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type or paste your numbers, separated by commas, spaces, or new lines.</li>
          <li>Read the mean, median, mode, and range in the result panel.</li>
          <li>Check the count, sum, minimum, maximum, and midrange.</li>
          <li>Follow the step-by-step work to see the sorted list and how each value was found.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
