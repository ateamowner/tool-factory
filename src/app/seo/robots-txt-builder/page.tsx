import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { RobotsTxtBuilder } from "@/components/tools/RobotsTxtBuilder";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/seo/robots-txt-builder";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "SEO", href: "/seo" },
  { name: "Robots.txt Builder", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a robots.txt builder?",
    answer:
      "A robots.txt builder — also used as a robot.txt generator — writes the Allow, Disallow, User-agent, and Sitemap lines for a robots.txt file so you can preview, copy, or download it without editing the file by hand.",
  },
  {
    question: "What is the difference between a robots.txt builder and a robot.txt generator?",
    answer:
      "They are the same job. Searchers often type robot.txt generator with a singular robot, but the file crawlers request is robots.txt. This page covers both names.",
  },
  {
    question: "Which AI crawlers can I block?",
    answer:
      "Presets and chips cover GPTBot, ChatGPT-User, OAI-SearchBot, ClaudeBot, anthropic-ai, Claude-SearchBot, Google-Extended, CCBot, Bytespider, PerplexityBot, Applebot-Extended, Meta-ExternalAgent, and Amazonbot. You can also type any other user-agent.",
  },
  {
    question: "Does a sitemap line belong in robots.txt?",
    answer:
      "Yes. Add one Sitemap URL per line. Crawlers that honor the directive can discover your XML sitemap from the robots.txt file at the site root.",
  },
  {
    question: "What are the optional llms.txt extras?",
    answer:
      "llms.txt is a companion file some sites publish for AI assistants. This robots.txt builder can add a comment pointing at your llms.txt URL and preview a short llms.txt draft. It does not upload either file.",
  },
  {
    question: "Does this robots.txt builder upload my rules?",
    answer:
      "No. User-agent groups, allow/disallow paths, sitemap URLs, and llms.txt extras are generated in your browser. Nothing is sent to a server or stored on our side.",
  },
];

export const metadata: Metadata = {
  title: "Robots.txt Builder — Free Robot.txt Generator",
  description:
    "Free robots.txt builder and robot.txt generator. Add user-agent groups, allow/disallow rules, sitemap URLs, and optional AI crawler or llms.txt extras. Preview, copy, or download in your browser.",
  alternates: { canonical: href },
};

export default function RobotsTxtBuilderPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Robots.txt Builder
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Build a robots.txt file with allow/disallow rules, user-agent groups,
        and a sitemap URL — the same page works as a robot.txt generator.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Allow / Disallow</li>
        <li className="chip inline-flex">AI crawlers</li>
        <li className="chip inline-flex">Sitemap + llms.txt</li>
      </ul>

      <div className="mt-8">
        <RobotsTxtBuilder />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A robots.txt builder writes the crawl rules you place at the site
          root. Crawlers request <span className="font-mono text-sm">/robots.txt</span>{" "}
          first. This page is also a robot.txt generator for the common
          misspelling: one URL, not a second thin page.
        </p>
        <p>
          Add a user-agent group, then Allow or Disallow paths. Use{" "}
          <span className="font-mono text-sm">*</span> for every crawler, or
          name GPTBot, ClaudeBot, Google-Extended, and other AI bots. Presets
          fill a public allow-all file, a full block, or a block-AI set. The
          sitemap field becomes a Sitemap line.
        </p>
        <p>
          Optional llms.txt extras add a comment pointing at an llms.txt URL
          and preview a short companion file. Everything runs in your browser.
          Browse more SEO tools on the{" "}
          <Link className="text-mint underline" href="/seo">
            SEO
          </Link>{" "}
          hub, or open the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
          </Link>
          . For pay math, use the{" "}
          <Link className="text-mint underline" href="/finance/paycheck-calculator-hourly">
            paycheck calculator hourly
          </Link>
          . For cost basis, try the{" "}
          <Link className="text-mint underline" href="/finance/stock-average-calculator">
            stock average calculator
          </Link>
          . Need local identifiers? Use the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          .
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the robots.txt builder
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Start from a preset, or keep the default public group.</li>
          <li>Set each user-agent. Add allow or disallow paths as needed.</li>
          <li>Optionally block GPTBot, ClaudeBot, Google-Extended, and other AI crawlers.</li>
          <li>Enter your sitemap URL. Turn on llms.txt extras if you want a companion comment.</li>
          <li>Copy or download the generated robots.txt. Place it at the site root.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
