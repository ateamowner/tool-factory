import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { HouseSqFtEstimator } from "@/components/tools/HouseSqFtEstimator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/house-sq-ft-estimator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "House Sq-Ft Estimator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do you estimate house wall square footage?",
    answer:
      "A common educational estimate is 2 × (length + width) × wall height × stories. This page uses 9 ft per story and does not subtract windows or doors. If you enter footprint only, the calculator treats that area as a square so it can estimate a perimeter.",
  },
  {
    question: "How do you estimate roof square footage from a footprint?",
    answer:
      "Plan area is length × width, or the footprint you type. An optional 6/12 pitch bump multiplies that plan area by about 1.118. Stories do not change roof area on this page — one roof still sits over the same footprint.",
  },
  {
    question: "Is a house square-foot estimator a contractor takeoff?",
    answer:
      "No. Results are educational envelope estimates. Real takeoffs measure openings, dormers, pitch, and waste. Do not treat the number as a bid quantity or a promise that a wash is needed.",
  },
  {
    question: "Can I send this area to a soft wash mix calculator?",
    answer:
      "Yes. After an estimate, use the link to the Soft Wash Mix Calculator and enter the wall or roof square feet there. Mix math is a separate educational tool.",
  },
  {
    question: "What happens when I request a local soft wash quote?",
    answer:
      "After a complete estimate, the form collects name, phone, ZIP or city, surface, and square feet. Surface and square feet prefill from walls (siding) or roof when possible. This site does not sell washing services and does not promise a price, crew, or appointment.",
  },
];

export const metadata: Metadata = {
  title: "House Sq-Ft Estimator — Wall & Roof Area for Soft Wash",
  description:
    "Free house square-foot estimator for walls or roof. Enter L×W or footprint, 1–2 stories, and an optional roof pitch bump. Educational area only — then request a local quote.",
  alternates: { canonical: href },
};

export default function HouseSqFtEstimatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        House Sq-Ft Estimator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate wall or roof square feet from length × width or footprint.
        Stories scale walls. An optional pitch bump applies only in roof mode.
        Educational only.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Walls or roof</li>
        <li className="chip inline-flex">L×W or footprint</li>
        <li className="chip inline-flex">Educational only</li>
      </ul>

      <div className="mt-8">
        <HouseSqFtEstimator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A house square-foot estimator answers a practical question: about how
          many square feet of wall or roof are you talking about? Enter the
          rectangle — length and width — or a single footprint. Toggle walls
          versus roof. Stories of 1 or 2 change wall height only.
        </p>
        <p>
          Walls use 2 × (L + W) × 9 ft × stories and do not deduct openings.
          Roof uses the plan footprint. The optional pitch bump is an
          educational 6/12 factor, not a measured rafter length. Results are
          not a takeoff.
        </p>
        <p>
          Area math runs in your browser. A quote request is sent only if you
          submit the form after results. Browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/home/soft-wash-mix-calculator">
            soft wash mix calculator
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/home/vinyl-siding-cleanability">
            vinyl siding cleanability checker
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
          How to use the house sq-ft estimator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose walls or roof.</li>
          <li>Enter length × width, or a footprint in square feet.</li>
          <li>Set stories to 1 or 2. Stories affect walls only.</li>
          <li>In roof mode, optionally add a typical 6/12 pitch bump.</li>
          <li>Read the wall or roof estimate, then optionally open the mix calculator.</li>
          <li>Optionally submit name, phone, ZIP or city, surface, and square feet for a local quote request.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
