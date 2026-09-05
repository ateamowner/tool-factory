export type FaqItem = {
  question: string;
  answer: string;
};

export function homePageJsonLd({
  siteOrigin,
  siteName,
  siteTagline,
  featured,
}: {
  siteOrigin: string;
  siteName: string;
  siteTagline: string;
  featured: { title: string; href: string }[];
}) {
  const siteUrl = `${siteOrigin}/`;
  const organizationId = `${siteOrigin}/#organization`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": organizationId,
        name: siteName,
        url: siteUrl,
        description: siteTagline,
      },
      {
        "@type": "WebSite",
        "@id": `${siteOrigin}/#website`,
        name: siteName,
        url: siteUrl,
        description: siteTagline,
        publisher: { "@id": organizationId },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteOrigin}/?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "ItemList",
        "@id": `${siteOrigin}/#featured-tools`,
        name: "Featured tools",
        numberOfItems: featured.length,
        itemListElement: featured.map((tool, index) => ({
          "@type": "ListItem",
          position: index + 1,
          name: tool.title,
          url: `${siteOrigin}${tool.href}`,
        })),
      },
    ],
  };
}

export function faqPageJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

export function breadcrumbJsonLd(
  items: { name: string; href: string }[],
  siteUrl: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${siteUrl}${item.href === "/" ? "" : item.href}`,
    })),
  };
}
