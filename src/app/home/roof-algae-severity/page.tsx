import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RoofAlgaeSeverity } from "@/components/tools/RoofAlgaeSeverity";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/roof-algae-severity";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Roof Algae Severity Quiz", href },
];

const faqs: FaqItem[] = [
  {
    question: "Is a roof algae severity score a diagnosis?",
    answer:
      "No. This quiz returns an educational 1–4 appearance score from streak coverage, roof age, tree cover, and whether a north face is involved. It is not a roof inspection, leak test, or manufacturer claim.",
  },
  {
    question: "What do the 1–4 severity levels mean?",
    answer:
      "1 is little or no visible streaking. 2 is light specks. 3 is distinct bands. 4 is heavy coverage, or lighter streaks plus age or shade factors. Levels 2–4 are labeled a typical soft-wash candidate from appearance only.",
  },
  {
    question: "Why do trees and a north face matter on a roof algae quiz?",
    answer:
      "Shade and moisture are commonly discussed with dark roof streaks. This page can bump a light-streak score when both tree cover and a north face are present. That is an educational hint, not proof of algae species.",
  },
  {
    question: "Does roof age change the score?",
    answer:
      "A 20+ year band can raise a light or banded score by one step, capped at 4. Older roofs are often where people first notice streaks. Age alone does not diagnose the roof.",
  },
  {
    question: "What happens when I request a local soft wash quote?",
    answer:
      "The form collects name, phone, ZIP or city, surface, and square feet. Surface prefills to roof. This site does not sell washing services and does not promise a price, crew, or appointment.",
  },
];

export const metadata: Metadata = {
  title: "Roof Algae Severity Quiz — Streak Coverage Score 1–4",
  description:
    "Free roof algae severity quiz. Enter streak coverage, roof age, tree cover, and north face for an educational 1–4 score and a typical soft-wash candidate note. Not a diagnosis — then request a local quote.",
  alternates: { canonical: href },
};

export default function RoofAlgaeSeverityPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Roof Algae Severity Quiz
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Score visible streak coverage from 1 to 4 using age, tree cover, and
        north face. Typical-candidate language is educational, not a
        diagnosis.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Severity 1–4</li>
        <li className="chip inline-flex">Appearance only</li>
        <li className="chip inline-flex">Educational only</li>
      </ul>

      <div className="mt-8">
        <RoofAlgaeSeverity />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A roof algae quiz answers a visual question: how much streaking are
          you describing, and do common shade or age factors show up? Choose
          none, light specks, bands, or heavy coverage. Add a roof age band,
          whether trees cover the roof, and whether a north face is in play.
        </p>
        <p>
          Coverage sets the base score. A 20+ year roof can bump light or
          banded answers by one step. Light streaks plus trees and a north
          face can bump again, still capped at 4. No visible streaks stay at
          1 even if the yard is shady. None of that identifies a species or
          a leak.
        </p>
        <p>
          Scoring runs in your browser. A quote request is sent only if you
          submit the form. Browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/home/soft-wash-mix-calculator">
            soft wash mix calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/home/house-sq-ft-estimator">
            house sq-ft estimator
          </Link>
          , or{" "}
          <Link className="text-mint underline" href="/home/vinyl-siding-cleanability">
            vinyl siding cleanability checker
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the roof algae severity quiz
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose streak coverage: none, light, bands, or heavy.</li>
          <li>Pick a roof age band.</li>
          <li>Say whether trees cover the roof and whether a north face is involved.</li>
          <li>Read the 1–4 score and the typical-candidate note.</li>
          <li>Optionally submit name, phone, ZIP or city, surface, and square feet for a local quote request.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
