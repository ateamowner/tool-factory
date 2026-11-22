import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { GpaCalculator } from "@/components/tools/GpaCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/gpa-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "GPA Calculator", href },
];

const faqs: FaqItem[] = [
  {
    "question": "What is GPA?",
    "answer": "GPA, or grade point average, is the average of your course grades on a numeric scale, weighted by credit hours. On the common 4.0 scale an A is 4.0, a B is 3.0, a C is 2.0, a D is 1.0, and an F is 0."
  },
  {
    "question": "How do you calculate GPA?",
    "answer": "Convert each letter grade to points, multiply by the course's credit hours, add those quality points, and divide by total credit hours. A 4-credit A (16 points), a 3-credit B (9 points), and a 3-credit C (6 points) give 31 points over 10 credits, a 3.10 GPA."
  },
  {
    "question": "What is the difference between weighted and unweighted GPA?",
    "answer": "Unweighted GPA uses the plain 4.0 scale. Weighted GPA adds bonus points for harder classes, commonly +0.5 for honors and +1.0 for AP or IB, so an A in an AP class counts as 5.0. This calculator shows both, and you can change the bonus values to match your school."
  },
  {
    "question": "How do I calculate cumulative GPA?",
    "answer": "Enter your prior cumulative GPA and prior credit hours, then add this semester's courses. The calculator multiplies your prior GPA by prior credits, adds this semester's quality points, and divides by all credits. A 3.00 GPA over 30 credits plus a 4.0 semester over 15 credits gives a 3.33 cumulative GPA."
  },
  {
    "question": "How many points is an A-, B+, or C-?",
    "answer": "On the common 4.0 scale an A- is 3.7, a B+ is 3.3, a B- is 2.7, a C+ is 2.3, a C- is 1.7, a D+ is 1.3, and a D- is 0.7. A+ is usually 4.0. The table beside the results lists every grade."
  },
  {
    "question": "Does an F get the honors or AP bonus?",
    "answer": "No. This calculator adds the honors or AP bonus only to passing grades, so an F stays at 0 points. Some schools use different rules, so check your school's policy."
  },
  {
    "question": "Does credit hours matter for GPA?",
    "answer": "Yes. A 4-credit course affects your GPA more than a 2-credit course, because each grade is weighted by its credit hours. If every course has the same credits, GPA is just the average of the grade points."
  },
  {
    "question": "Is my data sent anywhere?",
    "answer": "No. All math runs in your browser. Nothing you type is uploaded or stored."
  }
];

export const metadata: Metadata = {
  title: "GPA Calculator — Semester and Cumulative GPA",
  description:
    "Free GPA calculator. Enter letter grades and credit hours for a semester GPA, add honors and AP weighting, and combine with your prior GPA for a cumulative GPA. Nothing is uploaded.",
  alternates: { canonical: href },
};

export default function GpaCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">GPA Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Work out your semester and cumulative GPA on the 4.0 scale. Pick a
        letter grade and credit hours for each course, mark honors or AP
        classes for weighted GPA, and add your prior GPA and credits to see
        your cumulative result. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">4.0 scale</li>
        <li className="chip inline-flex">Honors and AP weighting</li>
        <li className="chip inline-flex">Cumulative GPA</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <GpaCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          GPA turns letter grades into points and averages them by credit
          hours. A course with more credits counts for more. Weighted GPA adds
          a bonus for honors (+0.5 by default) and AP or IB (+1.0 by default)
          classes, and you can change both bonuses to match your school.
        </p>
        <p>
          Example: an A in a 4-credit class, a B in a 3-credit class, and a C
          in a 3-credit class earn 16, 9, and 6 quality points. That is 31
          points over 10 credits, a 3.10 semester GPA. With a prior GPA of
          3.00 over 30 credits, the cumulative GPA would be 3.03.
        </p>
        <p>
          Need to turn a score into a percent first? Use the{" "}
          <Link className="text-mint underline" href="/math/percentage-calculator">
            percentage calculator
          </Link>
          . To find the average of a list of numbers, try the{" "}
          <Link className="text-mint underline" href="/math/mean-median-mode-calculator">
            mean median mode calculator
          </Link>
          . Browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates. Schools set their own grade scales, weighting,
          and rounding, so check your school&apos;s policy for official numbers.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the cap rate calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick a letter grade and enter credit hours for each course.</li>
          <li>Set the level to honors or AP / IB for weighted classes.</li>
          <li>Add or remove courses as needed.</li>
          <li>Optionally enter your prior GPA and prior credit hours.</li>
          <li>Read your semester and cumulative GPA.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
