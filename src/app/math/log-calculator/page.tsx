import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { LogCalculator } from "@/components/tools/LogCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/log-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Log Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a logarithm?",
    answer:
      "A logarithm answers the question: what power do I raise the base to in order to get this number? If 10³ = 1,000, then log₁₀(1,000) = 3. In general, log_b(x) = y means b^y = x. The number x must be positive, and the base b must be positive and not equal to 1.",
  },
  {
    question: "What is the difference between log and ln?",
    answer:
      "log usually means the common logarithm, base 10, so log(100) = 2. ln is the natural logarithm, base e (about 2.71828), so ln(e) = 1. This log calculator handles both: pick Base 10 for log, Base e for ln, or type any other base.",
  },
  {
    question: "How do I calculate a log with a different base?",
    answer:
      "Use the change of base formula: log_b(x) = ln(x) / ln(b), or equivalently log(x) / log(b). For log₂(8), ln(8) = 2.0794 and ln(2) = 0.6931, so 2.0794 / 0.6931 = 3. The calculator writes out each of these steps for any base.",
  },
  {
    question: "How do I find the natural log of a number?",
    answer:
      "Choose Base e (or type e as the base) and enter the number. For example, ln(10) = 2.302585. A natural log calculator gives the power you would raise e to in order to get your number, so e^2.302585 ≈ 10.",
  },
  {
    question: "What is an antilog and how do I calculate it?",
    answer:
      "The antilog (inverse log) undoes a logarithm: if log_b(x) = y, then x = b^y. The antilog of 3 in base 10 is 10³ = 1,000, and the antilog of 1 in base e is e¹ ≈ 2.71828. Switch to the Antilog tab, enter the log value and the base, and the calculator gives b^y.",
  },
  {
    question: "Why can't I take the log of zero or a negative number?",
    answer:
      "No power of a positive base can ever equal 0 or a negative number, so the real logarithm is undefined for x ≤ 0. As x gets closer to 0, log(x) heads toward negative infinity. The calculator tells you when the number must be positive.",
  },
  {
    question: "What are the basic log rules?",
    answer:
      "Product rule: log(xy) = log(x) + log(y). Quotient rule: log(x/y) = log(x) − log(y). Power rule: log(x^n) = n × log(x). Also log_b(1) = 0 and log_b(b) = 1. These rules work in every base, which is why change of base works with either log or ln.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The log calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Log Calculator — Log, Natural Log (ln) & Antilog With Steps",
  description:
    "Free log calculator. Find the logarithm of any number in base 10, base e (natural log, ln) or any custom base, plus the antilog, with change of base steps written out. Runs in your browser.",
  alternates: { canonical: href },
};

export default function LogCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Log Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the logarithm of a number in base 10, base e or any base you
        choose. This log calculator also works as a natural log (ln)
        calculator and an antilog calculator, and it writes out the change of
        base steps. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Log base 10</li>
        <li className="chip inline-flex">Natural log (ln)</li>
        <li className="chip inline-flex">Any custom base</li>
        <li className="chip inline-flex">Antilog</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <LogCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">Logarithm, natural log and ln calculator in one</h2>
        <p>
          A logarithm is an exponent. log_b(x) = y means b^y = x. Base 10 gives
          the common log, written log, and base e gives the natural log,
          written ln. Use the base buttons for those, or type any positive base
          other than 1 to get a log base 2, log base 5 or anything else.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Change of base formula</h2>
        <p>
          Most calculators only have log and ln keys. To get another base, use
          log_b(x) = ln(x) / ln(b). Example: log₅(100) = ln(100) / ln(5) =
          4.60517 / 1.60944 = 2.86135. The calculator shows this work for you.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Antilog</h2>
        <p>
          The antilog reverses a log. If log(x) = 2.5, then x = 10^2.5 =
          316.2278. For a natural log, x = e^y. Choose the Antilog tab to enter
          a log value and a base.
        </p>
        <p>
          Logs and exponents are inverses, so you can check any answer with the{" "}
          <Link className="text-mint underline" href="/math/exponent-calculator">
            exponent calculator
          </Link>
          . Very large or very small results read better in scientific notation,
          which you can convert with the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
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
          How to use the log calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick Logarithm or Antilog.</li>
          <li>Choose Base 10 (log), Base e (ln) or Base 2, or type any other base.</li>
          <li>Enter the number (it must be positive for a log) or the log value for an antilog.</li>
          <li>Read the answer, and follow the change of base steps underneath.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
