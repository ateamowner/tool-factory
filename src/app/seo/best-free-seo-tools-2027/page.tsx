import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl, toPublicUrl } from "@/lib/site";
import { getToolsByCategory } from "@/lib/tools";

/**
 * "Best free SEO tools 2027" guide.
 * Part 1 lists the real SEO tools in src/lib/tools.ts (category "seo").
 * Part 2 lists free first-party tools from Google and Bing.
 * No usage stats, ratings, or rankings are claimed.
 */

const href = "/seo/best-free-seo-tools-2027";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "SEO", href: "/seo" },
  { name: "Best Free SEO Tools 2027", href },
];

const ours = getToolsByCategory("seo");

const official = [
  {
    name: "Google Search Console",
    url: "https://search.google.com/search-console",
    use: "See which searches show your site, which pages are indexed, and submit a sitemap.",
  },
  {
    name: "Bing Webmaster Tools",
    url: "https://www.bing.com/webmasters",
    use: "The Bing version of Search Console. Bing results also feed some AI assistants.",
  },
  {
    name: "Google Rich Results Test",
    url: "https://search.google.com/test/rich-results",
    use: "Check whether Google can read the structured data on a live page.",
  },
  {
    name: "PageSpeed Insights",
    url: "https://pagespeed.web.dev/",
    use: "Measure how fast a page loads on phones and desktops, with fixes to try.",
  },
  {
    name: "Google Business Profile",
    url: "https://www.google.com/business/",
    use: "For local businesses: the free listing that shows in Google Maps.",
  },
];

const faqs: FaqItem[] = [
  {
    question: "What free SEO tools does a small business need in 2027?",
    answer:
      "Start with Google Search Console and Bing Webmaster Tools, because they show real search data for your own site. Add a robots.txt builder, a schema markup validator, and a UTM builder for tracking links. All of them are free.",
  },
  {
    question: "Are the Tool Factory SEO tools really free?",
    answer:
      "Yes. There is no signup and no paid tier. The tools run in your browser. The domain age checker sends only the domain name to a public RDAP server.",
  },
  {
    question: "Why are Tool Factory tools listed first?",
    answer:
      "Because this is the Tool Factory site and we built them. The Google and Bing tools below are not ours, and nobody paid to be on this page.",
  },
];

export const metadata: Metadata = {
  title: "Best Free SEO Tools for 2027 (No Signup)",
  description: `${ours.length} free browser SEO tools from Tool Factory, plus the free Google and Bing tools every small business site should use in 2027.`,
  alternates: { canonical: toPublicUrl(href) },
};

export default function BestFreeSeoTools2027Page() {
  const siteUrl = getSiteUrl();
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Best free SEO tools for 2027",
    numberOfItems: ours.length + official.length,
    itemListElement: [
      ...ours.map((tool, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: tool.title,
        url: toPublicUrl(tool.href),
      })),
      ...official.map((tool, i) => ({
        "@type": "ListItem",
        position: ours.length + i + 1,
        name: tool.name,
        url: tool.url,
      })),
    ],
  };

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <JsonLd data={itemList} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Best free SEO tools for 2027
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        The best free SEO setup for a small site in 2027 is Google Search
        Console and Bing Webmaster Tools for real search data, plus a few
        browser tools for robots.txt, schema, and tracking links. Here are{" "}
        {ours.length} free tools we built and {official.length} free tools from
        Google and Bing. No signup for any of them.
      </p>

      <section className="mt-12 max-w-3xl" aria-labelledby="ours-heading">
        <h2 id="ours-heading" className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Free SEO tools on Tool Factory
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          We built these, so we list them first. They run in your browser.
        </p>
        <ol className="mt-6 space-y-6">
          {ours.map((tool) => (
            <li key={tool.href}>
              <h3 className="text-lg font-semibold tracking-tight text-text">
                <Link href={tool.href} className="underline underline-offset-4">
                  {tool.title}
                </Link>
              </h3>
              <p className="mt-1 text-[15px] leading-7 text-text/90">{tool.summary}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="official-heading">
        <h2 id="official-heading" className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          Free tools from Google and Bing
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Not ours. Free, and worth setting up first.
        </p>
        <ol className="mt-6 space-y-6">
          {official.map((tool) => (
            <li key={tool.url}>
              <h3 className="text-lg font-semibold tracking-tight text-text">
                <a href={tool.url} className="underline underline-offset-4" rel="noopener">
                  {tool.name}
                </a>
              </h3>
              <p className="mt-1 text-[15px] leading-7 text-text/90">{tool.use}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text sm:text-3xl">
          A simple order to set them up
        </h2>
        <ol className="list-decimal space-y-2 pl-5">
          <li>Verify your site in Google Search Console and Bing Webmaster Tools, then submit your sitemap.</li>
          <li>Build or check your robots.txt so you are not blocking pages by mistake.</li>
          <li>Add schema to your main pages and check it with a schema validator and the Rich Results Test.</li>
          <li>Tag every ad and email link with UTM codes so you know what sent each visitor.</li>
          <li>If you serve a local area, fill out your Google Business Profile completely.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
    </main>
  );
}
