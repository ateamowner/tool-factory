import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { DomainAgeChecker } from "@/components/tools/DomainAgeChecker";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/seo/domain-age-checker";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "SEO", href: "/seo" },
  { name: "Domain Age Checker", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a domain age checker?",
    answer:
      "A domain age checker looks up a domain’s registration or creation date and reports how old the name is in years, months, and days. This page is a client-side domain age checker: it reads public RDAP in your browser or parses WHOIS text you paste.",
  },
  {
    question: "Is a website age checker the same as a domain age checker?",
    answer:
      "People also search for website age checker, check domain age, domain age lookup, and WHOIS age checker. Those names all point at this same page. Domain age is the age of the registered name, not how long a particular website has been online.",
  },
  {
    question: "How does this WHOIS age checker look up a domain?",
    answer:
      "Enter a domain and Validate. The tool normalizes the host (protocol, path, and optional www), then queries a public RDAP endpoint such as rdap.org or a registry RDAP URL from your browser. If a creation date is present, it calculates age and shows registrar and expiration when available.",
  },
  {
    question: "What if the RDAP lookup fails?",
    answer:
      "Many RDAP servers block browser requests (CORS) or return no creation event. When that happens, paste a WHOIS or RDAP record and parse it locally. Common fields include Creation Date, created, Registration Date, Registry Expiry Date, and Registrar.",
  },
  {
    question: "Does checking domain age send my data to your server?",
    answer:
      "No. This site does not proxy the lookup. A successful RDAP check sends the domain to a public RDAP endpoint from your browser. Pasted WHOIS or RDAP text is parsed in this tab and is never uploaded.",
  },
  {
    question: "Why might a domain age lookup show no date?",
    answer:
      "Some registries redact registration dates, some RDAP records omit a registration event, and some names are new enough that public data is incomplete. The empty state is honest: if no creation date is found, age is not guessed.",
  },
  {
    question: "Does domain age include the time since the website launched?",
    answer:
      "No. Domain age is counted from the registry creation or registration date. A site can be rebuilt, moved, or launched years after the name was registered. Content age and first-archive dates are a different question.",
  },
];

export const metadata: Metadata = {
  title: "Domain Age Checker — Free Website & WHOIS Age Lookup",
  description:
    "Free domain age checker. Look up registration date, domain age, registrar, and expiration from public RDAP in your browser, or paste WHOIS text. Nothing uploaded.",
  alternates: { canonical: href },
};

export default function DomainAgeCheckerPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Domain Age Checker
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Check domain age from a registration date — the same page is the
        website age checker and WHOIS age lookup. Public RDAP in the browser,
        or paste a record if the lookup is blocked.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">RDAP lookup</li>
        <li className="chip inline-flex">WHOIS paste</li>
        <li className="chip inline-flex">Years / months / days</li>
      </ul>

      <div className="mt-8">
        <DomainAgeChecker />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A domain age checker answers a simple SEO question: when was this
          name registered, and how old is it today? Searchers also call this a
          website age checker, a domain age lookup, or a WHOIS age checker.
          Those aliases stay on this page.
        </p>
        <p>
          Enter a host with or without https and www. The tool strips the
          protocol and path, optionally drops www, then asks a public RDAP
          endpoint for registration, expiration, and registrar fields. If the
          browser cannot read that response, paste WHOIS or RDAP text. Common
          labels such as Creation Date, created, and Registration Date are
          parsed locally.
        </p>
        <p>
          Pair it with the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          , the{" "}
          <Link className="text-mint underline" href="/seo/robots-txt-builder">
            robots.txt builder
          </Link>
          , and the{" "}
          <Link className="text-mint underline" href="/seo/schema-markup-validator">
            schema markup validator
          </Link>
          . For identifier format checks, use the{" "}
          <Link className="text-mint underline" href="/finance/vat-number-validator">
            VAT number validator
          </Link>
          . More SEO utilities live on the{" "}
          <Link className="text-mint underline" href="/seo">
            SEO
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the domain age checker
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter a domain. Protocol, path, and www are stripped as needed.</li>
          <li>Click Validate to query a public RDAP endpoint from this browser.</li>
          <li>Read the registration date, age, registrar, and expiration when present.</li>
          <li>If RDAP is blocked or empty, paste WHOIS or RDAP text and parse it locally.</li>
          <li>Do not treat domain age as proof of site quality or launch date.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
