import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { XmlFormatter } from "@/components/tools/XmlFormatter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/xml-formatter";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "XML Formatter", href },
];

const faqs: FaqItem[] = [
  {
    "question": "What does an XML formatter do?",
    "answer": "An XML formatter re-indents XML so every nested element sits on its own line at the right depth. It makes a one-line API response, sitemap, or config file readable without changing the data."
  },
  {
    "question": "How do I format XML online?",
    "answer": "Paste your XML into the box, choose 2 spaces, 4 spaces, or tabs, and press Format. The pretty-printed result appears below with a copy button and a download button."
  },
  {
    "question": "How do I validate XML?",
    "answer": "Paste it in. The tool checks that the XML is well-formed, which means one root element, matching and properly nested tags, quoted attribute values, no duplicate attributes, and valid entities. The first problem is reported with its line and column number."
  },
  {
    "question": "What is the difference between well-formed and valid XML?",
    "answer": "Well-formed XML follows the basic syntax rules. Valid XML is also checked against a schema such as an XSD or DTD. This tool checks well-formedness only, which catches the errors that stop most parsers."
  },
  {
    "question": "How do I minify XML?",
    "answer": "Switch Output to Minify. The tool removes the indentation and line breaks between tags and trims padding around text, so the file is as small as possible. Comments, CDATA sections, and attribute values are kept."
  },
  {
    "question": "Why does my XML show an error at a line number?",
    "answer": "The line and column point to where the parser first found a problem. Common causes are a closing tag that does not match, an unquoted attribute value, a stray ampersand that should be &amp;, or a second root element. Fix that spot and the next error, if any, will appear."
  },
  {
    "question": "Does formatting change my data?",
    "answer": "No. Only whitespace between tags changes. Element names, attributes, text, comments, CDATA sections, and the XML declaration stay as you wrote them. Text that spans several lines is joined onto one line."
  },
  {
    "question": "Is my XML sent anywhere?",
    "answer": "No. Parsing and formatting run in your browser. Nothing you paste is uploaded or stored, so it is safe for internal configs and API responses."
  }
];

export const metadata: Metadata = {
  title: "XML Formatter — Free Online XML Validator & Beautifier",
  description:
    "Free XML formatter and validator. Paste XML to pretty-print with 2 or 4 spaces or tabs, minify, and see line-numbered errors. Runs in your browser.",
  alternates: { canonical: href },
};

export default function XmlFormatterPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        XML Formatter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Paste XML to validate and pretty-print it in your browser. Pick your
        indent or minify, and get line-numbered errors when something is wrong.
        Nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Format</li>
        <li className="chip inline-flex">Minify</li>
        <li className="chip inline-flex">Validate with line numbers</li>
      </ul>

      <div className="mt-8">
        <XmlFormatter />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          An XML formatter turns a one-line feed, sitemap, or config file into
          readable, indented XML. Every nested element gets its own line and
          level, so you can scan the structure, spot a missing tag, and copy a
          clean version back into your editor.
        </p>
        <p>
          The formatter is also an XML validator. It checks that the document
          is well-formed: one root element, tags that open and close in order,
          quoted attribute values, no duplicate attributes, and valid entities
          such as <code>&amp;amp;</code>. The first error is reported with its
          line and column. Valid input shows its element count, attribute
          count, nesting depth, and size in bytes.
        </p>
        <p>
          Everything stays in this tab, with no upload and no account. Working
          with JSON instead? Use the{" "}
          <Link className="text-mint underline" href="/dev/json-formatter">
            JSON formatter
          </Link>
          . Tidy a query with the{" "}
          <Link className="text-mint underline" href="/dev/sql-formatter">
            SQL formatter
          </Link>
          , read a token with the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          , or check structured data with the{" "}
          <Link className="text-mint underline" href="/seo/schema-markup-validator">
            schema markup validator
          </Link>
          . More utilities live on the{" "}
          <Link className="text-mint underline" href="/dev">
            Developer
          </Link>{" "}
          hub.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the XML formatter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste XML into the box, or load the sample.</li>
          <li>Fix anything flagged as Invalid XML at the reported line and column.</li>
          <li>Choose Pretty-print or Minify and your indent.</li>
          <li>Copy the result or download it as a .xml file.</li>
          <li>Clear the box when you are done. Nothing is stored.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
