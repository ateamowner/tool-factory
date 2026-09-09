import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { VinylSidingCleanability } from "@/components/tools/VinylSidingCleanability";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/vinyl-siding-cleanability";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Vinyl Siding Cleanability Checker", href },
];

const faqs: FaqItem[] = [
  {
    question: "What does a vinyl siding cleanability score mean?",
    answer:
      "It is an educational fit label — good, caution, or skip — based on siding type, soil, age band, and shade. It is not a material inspection, a warranty reading, or a promise that a wash is safe or effective on your house.",
  },
  {
    question: "Is vinyl a typical soft-wash conversation?",
    answer:
      "Algae or ordinary dirt on vinyl is the most common educational example people look up. Oxidation or chalking is a different problem: a wash may clean film and still not restore the original color.",
  },
  {
    question: "Why does wood score as skip?",
    answer:
      "Wood is not a typical sodium-hypochlorite soft-wash surface. Bleach mixes can raise grain and fade finishes. This page does not treat wood as a default house-wash material.",
  },
  {
    question: "Why is fiber cement only caution?",
    answer:
      "Fiber-cement makers often publish their own wash limits. This checker does not invent a mix or a service claim for those products. Check the panel guidance you actually have.",
  },
  {
    question: "What happens when I request a local soft wash quote?",
    answer:
      "The form collects name, phone, ZIP or city, surface, and square feet. Surface prefills to siding. This site does not sell washing services and does not promise a price, crew, or appointment.",
  },
];

export const metadata: Metadata = {
  title: "Vinyl Siding Cleanability Checker — Soft-Wash Fit Score",
  description:
    "Free vinyl siding cleanability checker. Enter siding type, soil, age band, and shade for an educational good / caution / skip soft-wash fit score. Not a diagnosis — then request a local quote.",
  alternates: { canonical: href },
};

export default function VinylSidingCleanabilityPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Vinyl Siding Cleanability Checker
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        See an educational good, caution, or skip fit for a soft-wash
        conversation from siding type, soil, age, and shade. Not a diagnosis.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Good / caution / skip</li>
        <li className="chip inline-flex">Vinyl, fiber cement, wood</li>
        <li className="chip inline-flex">Educational only</li>
      </ul>

      <div className="mt-8">
        <VinylSidingCleanability />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A cleanability checker answers a narrow question: does this
          combination sound like the usual vinyl soft-wash conversation, or
          should you pause? Pick vinyl, fiber cement, wood, or other. Then
          choose algae, oxidation, or dirt, an age band, and whether the wall
          stays shaded.
        </p>
        <p>
          Vinyl plus algae is the common educational example. Oxidation is
          called out as a different problem than green film. Wood is marked
          skip because bleach mixes are a poor match for most wood siding.
          Fiber cement stays at caution because manufacturers publish their
          own limits.
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
          <Link className="text-mint underline" href="/home/roof-algae-severity">
            roof algae severity quiz
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the vinyl siding cleanability checker
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose vinyl, fiber cement, wood, or other.</li>
          <li>Set soil to algae, oxidation, or dirt.</li>
          <li>Pick an age band and whether the wall is mostly shaded.</li>
          <li>Read the good / caution / skip label and the short why.</li>
          <li>Optionally submit name, phone, ZIP or city, surface, and square feet for a local quote request.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
