import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SoftWashMixCalculator } from "@/components/tools/SoftWashMixCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/soft-wash-mix-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Soft Wash Mix Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How does a soft wash mix calculator work?",
    answer:
      "A soft wash mix calculator estimates gallons of finished mix from the area you enter and a typical coverage rate for that surface. It then splits bleach and water so the finished mix hits a target sodium hypochlorite (SH) percent, and adds surfactant in ounces per gallon. Heavy soil uses the high end of the labeled typical pro range.",
  },
  {
    question: "What bleach percentage is typical for siding, roof, concrete, and fence?",
    answer:
      "This page labels those strengths as a typical pro range, not a spec: siding and fence about 0.5–1% SH, concrete about 4–6% SH, and roof about 10–12.5% SH with ~12% as the middle. Your local rules, surface, and plant risk can require a weaker mix. Roof work in particular varies by contractor and stock strength.",
  },
  {
    question: "How much surfactant do you add per gallon of soft wash mix?",
    answer:
      "A common educational range is about 1–2 ounces of surfactant per gallon of finished mix. This calculator defaults to 1.5 oz/gal. Follow the product label for the soap you actually use.",
  },
  {
    question: "How do you calculate bleach and water for a target SH percent?",
    answer:
      "Bleach gallons = mix gallons × (target SH % ÷ stock SH %). Water gallons = mix gallons − bleach gallons. Stock SH is the jug strength — often about 12.5% for professional sodium hypochlorite. If the jug is weaker than the target, you cannot reach that target without a stronger stock.",
  },
  {
    question: "Is this soft wash mix calculator a chemical specification?",
    answer:
      "No. Results are educational estimates only. Follow local codes, the chemical labels, and plant and property safety. Do not treat the numbers as a licensed applicator spec or a promise that a job is safe or legal in your area.",
  },
  {
    question: "What happens when I request a local soft wash quote?",
    answer:
      "After a complete mix estimate, the form collects name, phone, ZIP or city, surface, and square feet. That request is sent only when you submit the form. This site does not sell washing services and does not promise a price, crew, or appointment.",
  },
];

export const metadata: Metadata = {
  title: "Soft Wash Mix Calculator — Bleach, Water & Surfactant by Surface",
  description:
    "Free soft wash mix calculator for siding, roof, concrete, and fence. Enter square feet or L×W and soil level to see typical pro-range SH %, mix gallons, bleach, water, and surfactant. Educational only.",
  alternates: { canonical: href },
};

export default function SoftWashMixCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Soft Wash Mix Calculator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Estimate gallons of mix, bleach, water, and surfactant from surface,
        square feet, and soil. Ranges are labeled as a typical pro range.
        Educational only.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Typical pro ranges</li>
        <li className="chip inline-flex">Mix + bleach + water</li>
        <li className="chip inline-flex">Educational only</li>
      </ul>

      <div className="mt-8">
        <SoftWashMixCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A soft wash mix calculator answers a practical question: how much
          finished mix, bleach, water, and surfactant might a job need? Enter
          the washable area — total square feet, or length × width — then pick
          siding, roof, concrete, or fence. Soil level moves the target SH
          percent within the labeled typical pro range. Heavy soil uses the
          high end.
        </p>
        <p>
          Coverage is an educational assumption (more mix per square foot on
          roofs than on siding). Stock SH defaults to 12.5%. Surfactant
          defaults to 1.5 oz/gal inside a 1–2 oz/gal typical range. Results are
          not a specification. Follow local codes and protect plants, people,
          and property.
        </p>
        <p>
          Mix math runs in your browser. A quote request is sent only if you
          submit the form after results. Browse the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/emergency-fund-calculator">
            emergency fund calculator
          </Link>
          , or{" "}
          <Link className="text-mint underline" href="/convert/heic-to-png">
            HEIC to PNG converter
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the soft wash mix calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose siding, roof, concrete, or fence.</li>
          <li>Enter square feet, or length × width. Add stories only if you used dimensions.</li>
          <li>Set soil to light, medium, or heavy.</li>
          <li>Confirm stock SH % and surfactant oz/gal, or keep the defaults.</li>
          <li>Read mix, bleach, water, surfactant, and the dwell/rinse tip.</li>
          <li>Optionally submit name, phone, ZIP or city, surface, and square feet for a local quote request.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
