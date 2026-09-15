import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { SqlFormatter } from "@/components/tools/SqlFormatter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/sql-formatter";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "SQL Formatter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a SQL formatter?",
    answer:
      "A SQL formatter pretty-prints a query so clauses, joins, and lists are easier to read. Paste SQL, indent SELECT / FROM / WHERE blocks, then copy the formatted statement. This page runs entirely in your browser.",
  },
  {
    question: "Does this SQL formatter change how my query runs?",
    answer:
      "No. Formatting only changes whitespace and reserved-word casing. Identifiers, string literals, and comments stay as you pasted them. Run the output in your own database client if you need to confirm behavior.",
  },
  {
    question: "Which SQL dialects does this formatter support?",
    answer:
      "Generic SQL is the default. Common PostgreSQL, MySQL, SQL Server, and SQLite queries usually format well. Vendor-only tokens are left as written. There is no dialect picker and no server-side parser.",
  },
  {
    question: "Is my SQL uploaded to a server?",
    answer:
      "No. Paste, format, and copy stay in this tab. We do not log, store, or send queries. Use it on confidential statements the same way you would a local editor plugin.",
  },
  {
    question: "Can I format SELECT, INSERT, UPDATE, and DELETE?",
    answer:
      "Yes. The formatter recognizes those statements plus JOIN / ON, GROUP BY, ORDER BY, HAVING, LIMIT, UNION, CASE, and nested subqueries in parentheses. Multiple statements separated by semicolons are formatted one after another.",
  },
  {
    question: "Does the SQL formatter uppercase keywords?",
    answer:
      "Yes. Reserved words such as SELECT, FROM, and WHERE are written in uppercase. Table names, column names, and quoted identifiers keep the casing you typed.",
  },
  {
    question: "What happens to comments and string literals?",
    answer:
      "Line comments (-- …) and block comments (/* … */) are kept. Text inside quotes is not parsed as SQL, so a string like 'from' will not start a FROM clause.",
  },
  {
    question: "Can I copy the formatted SQL?",
    answer:
      "Yes. After you paste a query, use Copy on the formatted result, or press Format to replace the input box with the pretty-printed SQL. Clear removes both.",
  },
];

export const metadata: Metadata = {
  title: "SQL Formatter — Free Online SQL Pretty Printer",
  description:
    "Free SQL formatter. Paste a query to pretty-print with indentation, then copy the formatted SQL. Generic SQL in your browser — nothing uploaded.",
  alternates: { canonical: href },
};

export default function SqlFormatterPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        SQL Formatter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Paste SQL and pretty-print it in your browser — indentation, uppercase
        keywords, and a copyable result. Nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Pretty-print</li>
        <li className="chip inline-flex">Generic SQL</li>
        <li className="chip inline-flex">Copy result</li>
      </ul>

      <div className="mt-8">
        <SqlFormatter />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A SQL formatter turns a minified or hand-typed query into a readable
          layout. Paste a statement, and this page splits clauses onto their
          own lines, indents select lists and join conditions, and uppercases
          reserved words so <code>SELECT</code>, <code>FROM</code>, and{" "}
          <code>WHERE</code> are easy to scan.
        </p>
        <p>
          Nested subqueries in parentheses get another indent level.{" "}
          <code>JOIN</code> / <code>ON</code>, <code>AND</code> / <code>OR</code>,
          and <code>CASE</code> / <code>WHEN</code> follow the same rules.
          String literals and comments are left alone, so a quoted{" "}
          <code>from</code> does not become a clause.
        </p>
        <p>
          Everything stays in this tab — no upload, no account. Need random
          IDs for a fixture? Open the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          . To inspect a token, use the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          . For a crontab line, try the{" "}
          <Link className="text-mint underline" href="/dev/cron-expression-generator">
            cron expression generator
          </Link>
          . Check structured data with the{" "}
          <Link className="text-mint underline" href="/seo/schema-markup-validator">
            schema markup validator
          </Link>
          . More utilities live on the{" "}
          <Link className="text-mint underline" href="/dev">
            Developer
          </Link>{" "}
          and{" "}
          <Link className="text-mint underline" href="/seo">
            SEO
          </Link>{" "}
          hubs.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the SQL formatter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste a query into the SQL box, or load the sample.</li>
          <li>Read the pretty-printed output with indented clauses.</li>
          <li>Optionally press Format to replace the input with that output.</li>
          <li>Copy the formatted SQL into an editor, ticket, or client.</li>
          <li>Clear the box when you are done. Nothing is stored.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
