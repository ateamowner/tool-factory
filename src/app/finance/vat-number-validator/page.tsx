import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { VatNumberValidator } from "@/components/tools/VatNumberValidator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/finance/vat-number-validator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Finance", href: "/finance" },
  { name: "VAT Number Validator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a VAT number validator?",
    answer:
      "A VAT number validator checks whether an EU VAT ID has the right country prefix, length, pattern, and — where the algorithm is public — check digits. This page is a client-side VAT number validator: it normalizes spaces and punctuation, then reports valid or invalid with a human-readable reason.",
  },
  {
    question: "Is a VAT number checker the same as a VAT number validator?",
    answer:
      "Yes. People also search for VAT number checker, EU VAT validator, and VAT checker. Those names all point at this same page. There is no second URL for those aliases.",
  },
  {
    question: "Does this EU VAT validator call VIES or another tax API?",
    answer:
      "No. Validation runs in your browser. The tool does not call VIES, a national tax authority, or any other server. A matching format and check digit does not mean the number is registered, in use, or entitled to charge VAT.",
  },
  {
    question: "Which countries can I check?",
    answer:
      "EU member prefixes are supported, plus GB for the legacy United Kingdom format and XI for Northern Ireland. You can paste a number with a prefix such as DE or FR, or choose a country and enter the digits alone. Greece accepts EL or the older GR prefix.",
  },
  {
    question: "Do I need the country prefix on the VAT number?",
    answer:
      "No. Include AT, BE, DE, and so on when you have it, or leave the prefix off and pick a country in the selector. The validator uppercases the value, strips spaces, dots, and dashes, and shows a normalized ID such as DE136695976.",
  },
  {
    question: "What does an invalid VAT number checker result mean?",
    answer:
      "Invalid means the normalized ID failed that country’s published length, pattern, or check-digit rules. Typical causes are a mistyped digit, a missing letter (such as the Austrian U or the Dutch B), or a prefix that does not match the selected country. It is not a statement from a tax authority.",
  },
  {
    question: "Is my VAT number uploaded?",
    answer:
      "No. The VAT number, country choice, and result stay in this tab. We do not log, store, or send VAT IDs, and we do not look them up in VIES.",
  },
];

export const metadata: Metadata = {
  title: "VAT Number Validator — Free EU VAT Number Checker",
  description:
    "Free VAT number validator and VAT number checker. Check EU VAT ID format and public check digits in your browser — not a VIES lookup, nothing uploaded.",
  alternates: { canonical: href },
};

export default function VatNumberValidatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        VAT Number Validator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Check an EU VAT ID for country, length, pattern, and public check
        digits. The same page is the VAT number checker — format only, not a
        registration lookup.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">EU + GB format</li>
        <li className="chip inline-flex">Check digits</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <VatNumberValidator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A VAT number validator is for the ID printed on an invoice or in a
          company profile: does this string look like a German, French, or
          other EU VAT number, and do the published check digits line up?
          Searchers also call this a VAT number checker, an EU VAT validator,
          or a VAT checker. Those aliases stay on this page.
        </p>
        <p>
          Paste a number with or without a country prefix. The tool strips
          spaces, dots, and dashes, uppercases the value, then applies that
          country’s length and pattern rules. Where the algorithm is public —
          including DE, FR, AT, NL, BE, ES, IT, PL, SE, DK, FI, IE, and PT —
          it also verifies check digits. Other members use a documented
          fallback pattern. Results never leave the browser.
        </p>
        <p>
          This is not proof that a business is VAT-registered. Pair it with
          other{" "}
          <Link className="text-mint underline" href="/finance">
            Finance
          </Link>{" "}
          tools such as the{" "}
          <Link className="text-mint underline" href="/finance/monthly-budget-template">
            monthly budget template
          </Link>
          ,{" "}
          <Link className="text-mint underline" href="/finance/403b-calculator">
            403b calculator
          </Link>
          , or{" "}
          <Link className="text-mint underline" href="/finance/real-estate-commission-calculator">
            real estate commission calculator
          </Link>
          . For structured data on a site, use the{" "}
          <Link className="text-mint underline" href="/seo/schema-markup-validator">
            schema markup validator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the VAT number validator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste a VAT number with or without the country prefix.</li>
          <li>Optionally choose an EU country, XI, or legacy GB if the prefix is missing.</li>
          <li>Read valid or invalid, the country, the normalized ID, and the reason.</li>
          <li>Copy the normalized ID if you want a clean version without spaces.</li>
          <li>Do not treat a valid format as proof the number is active in VIES.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
