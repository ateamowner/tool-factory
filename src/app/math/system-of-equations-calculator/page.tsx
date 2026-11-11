import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SystemOfEquationsCalculator } from "@/components/tools/SystemOfEquationsCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/system-of-equations-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "System of Equations Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a system of equations?",
    answer:
      "A system of equations is a set of two or more equations that share the same unknowns. A solution is a set of values that makes every equation true at the same time. A 2x2 system has two equations and two unknowns (x and y), and a 3x3 system has three equations and three unknowns (x, y, and z).",
  },
  {
    question: "How do I solve a system of equations by substitution?",
    answer:
      "Solve one equation for one variable, then substitute that expression into the other equations. For x + y = 5 and 2x − y = 1, the first gives y = 5 − x. Substituting into the second gives 2x − (5 − x) = 1, so 3x = 6 and x = 2. Then y = 5 − 2 = 3. The calculator writes out each of these steps on the Substitution tab.",
  },
  {
    question: "How do I solve a system of equations by elimination?",
    answer:
      "Add or subtract multiples of the equations so that one variable cancels. For x + y = 5 and 2x − y = 1, adding the equations gives 3x = 6, so x = 2, and then y = 3. For three equations, eliminate one variable from two pairs to get a 2x2 system, then finish as usual. The Elimination tab shows each row operation, such as R2 − 2 × R1.",
  },
  {
    question: "What does it mean when there is no solution?",
    answer:
      "The equations contradict each other, so no values of the variables satisfy all of them. For x + y = 2 and 2x + 2y = 5, doubling the first equation gives 2x + 2y = 4, which cannot also equal 5. While solving you end up with a false statement such as 0 = 1. Graphically, the two lines are parallel and never meet.",
  },
  {
    question: "What does it mean when there are infinitely many solutions?",
    answer:
      "One equation is just a multiple or combination of the others, so they describe the same line (or plane). For x + y = 2 and 2x + 2y = 4, every point on the line works. While solving you end up with 0 = 0. The determinant of the coefficients is 0 in this case, just as it is for no solution, so the steps tell you which case you have.",
  },
  {
    question: "What is the determinant of a system?",
    answer:
      "The determinant is a number built from the coefficients (ad − bc for a 2x2 system). If it is not 0, the system has exactly one solution. If it is 0, the system has either no solution or infinitely many. This system of equations calculator shows the determinant next to the answer.",
  },
  {
    question: "Can I enter fractions and decimals?",
    answer:
      "Yes. Enter integers, decimals like 2.5, or fractions like 1/3 in any box, and use 0 for a variable that is missing from an equation. Answers are computed with exact fractions, so a result like x = 2/3 is shown exactly, along with its decimal value, instead of being rounded early.",
  },
  {
    question: "Is my information saved or uploaded?",
    answer:
      "No. The system of equations calculator runs entirely in your browser. Numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "System of Equations Calculator — 2x2 & 3x3 With Steps",
  description:
    "Free system of equations calculator. Solve 2x2 and 3x3 linear systems by substitution and elimination with every step written out, exact fractions, and no-solution or infinite-solution detection. Runs in your browser.",
  alternates: { canonical: href },
};

export default function SystemOfEquationsCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">System of Equations Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Solve a system of two or three linear equations and see the work. Switch
        between substitution and elimination, get exact fractions, and find out
        right away if a system has no solution or infinitely many. Everything
        runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">2x2 and 3x3 systems</li>
        <li className="chip inline-flex">Substitution steps</li>
        <li className="chip inline-flex">Elimination steps</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <SystemOfEquationsCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">Solve a system of equations by substitution or elimination</h2>
        <p>
          Substitution solves one equation for a variable and plugs it into the
          rest. Elimination adds or subtracts multiples of the equations until a
          variable cancels. Both reach the same answer, so use whichever is
          easier to follow. This solve system of equations calculator writes out
          both methods.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Example: a 2x2 system</h2>
        <p>
          Solve 2x + y = 5 and x − y = 1. Adding the equations cancels y and
          gives 3x = 6, so x = 2. Then 2(2) + y = 5, so y = 1. The solution is
          (2, 1), the point where the two lines cross.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Example: a 3x3 system</h2>
        <p>
          Solve x + y + z = 6, 2y + 5z = −4, and 2x + 5y − z = 27. Eliminating x
          from the third equation leaves 3y − 3z = 15, which simplifies to
          y − z = 5. Combining that with 2y + 5z = −4 gives z = −2, then y = 3
          and x = 5.
        </p>
        <p>
          Each equation is a line, so you can find a line&apos;s steepness with
          the{" "}
          <Link className="text-mint underline" href="/math/slope-calculator">
            slope calculator
          </Link>
          . If one equation has an x² term, use the{" "}
          <Link className="text-mint underline" href="/math/quadratic-formula-calculator">
            quadratic formula calculator
          </Link>
          . You can also simplify fractions in your answers with the{" "}
          <Link className="text-mint underline" href="/math/gcf-calculator">
            GCF calculator
          </Link>{" "}
          or browse more tools in the{" "}
          <Link className="text-mint underline" href="/math">
            Math
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the system of equations calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose a 2x2 or 3x3 system.</li>
          <li>Enter the coefficients and the constant for each equation, using 0 for a missing variable.</li>
          <li>Read the solution, the system type, and the determinant in the result panel.</li>
          <li>Switch between Elimination and Substitution to see the steps written out.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
