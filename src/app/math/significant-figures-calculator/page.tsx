import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SignificantFiguresCalculator } from "@/components/tools/SignificantFiguresCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/significant-figures-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Significant Figures Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What are significant figures?",
    answer:
      "Significant figures (sig figs) are the digits in a number that carry real information about its precision. They start at the first nonzero digit and include every digit after it that was actually measured or known. A length written as 12.30 cm has 4 significant figures, which tells the reader it was measured to the hundredth of a centimeter.",
  },
  {
    question: "What are the rules for counting significant figures?",
    answer:
      "Nonzero digits always count. Zeros between nonzero digits always count, so 1002 has 4. Leading zeros never count, so 0.0045 has 2. Trailing zeros count when the number has a decimal point, so 4.50 and 100.0 have 3 and 4. Trailing zeros in a whole number with no decimal point, like 1200, are ambiguous and are usually not counted.",
  },
  {
    question: "How many significant figures does 1200 have?",
    answer:
      "It depends on how it was written. Most textbooks say 1200 has 2 significant figures, because the trailing zeros may only be placeholders, but it could have 3 or 4 if those zeros were measured. Write 1200. (with a decimal point) for 4, or use scientific notation, 1.20 × 10³ for 3 or 1.2 × 10³ for 2, to remove the doubt. The calculator shows the usual count and the maximum.",
  },
  {
    question: "Do zeros after a decimal point count?",
    answer:
      "Trailing zeros after a decimal point do count, because nobody writes them unless they were measured: 2.50 has 3 significant figures and 0.0400 has 3. Zeros right after the decimal point but before the first nonzero digit, like the zeros in 0.004, do not count. They only show where the decimal point sits.",
  },
  {
    question: "How do you round to a number of significant figures?",
    answer:
      "Count significant digits from the first nonzero digit and keep the number you want. Look at the next digit: if it is 5 or more, add 1 to the last kept digit; if it is 4 or less, leave it. Replace dropped digits left of the decimal point with zeros and drop the rest. For example, 0.004567 to 2 significant figures is 0.0046, and 123,456 to 3 is 123,000, or 1.23 × 10⁵.",
  },
  {
    question: "How do significant figures work in scientific notation?",
    answer:
      "In scientific notation every digit in the number before × 10 is significant, and the power of ten never adds any. So 6.02 × 10²³ has 3 significant figures and 1.200 × 10³ has 4. That is why scientists use it: it shows exactly how many digits are meaningful, even for whole numbers that end in zeros. You can type numbers like 6.02e23 or 6.02 × 10^23.",
  },
  {
    question: "How many significant figures should an answer have?",
    answer:
      "When multiplying or dividing, keep as many significant figures as the measurement with the fewest. For 4.56 × 1.4, the answer 6.384 rounds to 6.4 (2 sig figs). When adding or subtracting, match the fewest decimal places instead, so 12.11 + 0.3 = 12.4. Exact counts, like 3 apples, and defined constants do not limit the answer. Round only at the end to avoid rounding errors.",
  },
  {
    question: "What is the difference between significant figures and decimal places?",
    answer:
      "Decimal places count only digits to the right of the decimal point, while significant figures count from the first nonzero digit wherever it is. 0.0050 has 4 decimal places but 2 significant figures, and 1,234.5 has 1 decimal place but 5 significant figures. To round to decimal places instead, use the rounding calculator. Everything here runs in your browser, and nothing is uploaded.",
  },
];

export const metadata: Metadata = {
  title: "Significant Figures Calculator — Count & Round Sig Figs",
  description:
    "Free significant figures calculator. Count sig figs in any number, see which zeros count, and round to any number of significant figures. Handles trailing zeros, decimals and scientific notation, with steps.",
  alternates: { canonical: href },
};

export default function SignificantFiguresCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Significant Figures Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Count the significant figures in any number and see exactly which digits
        count, which zeros are placeholders and which are ambiguous. Round to any
        number of sig figs and get the answer in standard form, scientific
        notation and E notation, with steps. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Sig fig counter</li>
        <li className="chip inline-flex">Round to N sig figs</li>
        <li className="chip inline-flex">Trailing zeros & scientific notation</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SignificantFiguresCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>Five rules decide which digits are significant:</p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Nonzero digits</strong> always count. 4.56 has 3.
          </li>
          <li>
            <strong>Sandwiched zeros</strong> between nonzero digits always count.
            3.007 has 4.
          </li>
          <li>
            <strong>Leading zeros</strong> never count. 0.0072 has 2.
          </li>
          <li>
            <strong>Trailing zeros with a decimal point</strong> count. 7.200 has 4,
            and 1500. has 4.
          </li>
          <li>
            <strong>Trailing zeros without a decimal point</strong> are ambiguous.
            1500 has 2 by the usual rule, but could have up to 4.
          </li>
        </ul>
        <p>
          Example: round 0.0045678 to 3 significant figures. The first nonzero
          digit is 4, so the first three significant digits are 4, 5 and 6. The
          next digit is 7, which is 5 or more, so 456 rounds up to 457 and the
          answer is 0.00457, or 4.57 × 10⁻³.
        </p>
        <p>
          Need decimal places instead? The{" "}
          <Link className="text-mint underline" href="/math/rounding-calculator">
            rounding calculator
          </Link>{" "}
          rounds to any number of decimal places or the nearest 10, 100 or 1,000.
          Convert numbers and do math in powers of ten with the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
          </Link>
          , raise numbers to a power with the{" "}
          <Link className="text-mint underline" href="/math/exponent-calculator">
            exponent calculator
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
          How to use the significant figures calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Type a number exactly as written, including any trailing zeros or decimal point. Scientific notation like 6.02e23 or 6.02 × 10^23 works too.</li>
          <li>Read the sig fig count and see each digit marked as significant, placeholder or ambiguous.</li>
          <li>Enter how many significant figures you want to round to.</li>
          <li>Copy the rounded answer in standard form, scientific notation or E notation, and follow the steps.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
