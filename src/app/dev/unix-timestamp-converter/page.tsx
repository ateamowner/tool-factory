import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { UnixTimestampConverter } from "@/components/tools/UnixTimestampConverter";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/unix-timestamp-converter";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "Unix Timestamp Converter", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a Unix timestamp?",
    answer:
      "A Unix timestamp is the number of seconds (or milliseconds) that have passed since the Unix epoch, which is 00:00:00 UTC on 1 January 1970. It is a compact way to store and compare instants in logs, APIs, and databases.",
  },
  {
    question: "What is the difference between seconds and milliseconds?",
    answer:
      "A 10-digit timestamp such as 1609459200 is almost always in seconds. A 13-digit value such as 1609459200000 is milliseconds. JavaScript’s Date.now() returns milliseconds. This converter’s Auto mode treats values of 1,000,000,000,000 or more as milliseconds.",
  },
  {
    question: "How do I convert a Unix timestamp to a date?",
    answer:
      "Paste the number into Unix time to date. Leave Unit on Auto, or choose Seconds or Milliseconds if you already know the unit. The tool shows the instant in UTC, your local timezone, ISO 8601, and RFC 2822.",
  },
  {
    question: "How do I convert a date to a Unix timestamp?",
    answer:
      "In Date to Unix time, pick a date and time and choose UTC or Local time. The result is shown in both seconds and milliseconds, ready to copy into code or a database.",
  },
  {
    question: "Does this Unix timestamp converter use UTC or my local time?",
    answer:
      "Both. Every conversion lists the UTC time and your browser’s local time, including the timezone abbreviation. When you convert a date, you choose whether the fields should be read as UTC or as local time.",
  },
  {
    question: "What is the current Unix timestamp?",
    answer:
      "The Current Unix time box at the top of this page updates live in your browser and shows both seconds and milliseconds, plus the matching UTC and local clock times. Use the copy buttons to grab either value.",
  },
  {
    question: "Can I convert timestamps from before 1970?",
    answer:
      "Yes. Dates before the epoch use negative timestamps. For example, -1 is 23:59:59 UTC on 31 December 1969. Far-future and far-past values work up to the range your browser’s Date object supports.",
  },
  {
    question: "Is my timestamp uploaded to a server?",
    answer:
      "No. Conversions, the live clock, and copy actions all run in this tab. Nothing is logged, stored, or uploaded, so it is safe for production logs and private tokens.",
  },
];

export const metadata: Metadata = {
  title: "Unix Timestamp Converter — Epoch to Date in Your Browser",
  description:
    "Free Unix timestamp converter. Convert seconds or milliseconds to UTC and local dates, or turn a date into Unix time. Live current timestamp. Runs in your browser.",
  alternates: { canonical: href },
};

export default function UnixTimestampConverterPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Unix Timestamp Converter
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Convert Unix time in seconds or milliseconds to a readable date, or
        turn a date into a timestamp. See UTC and your local time, and watch
        the current Unix time update live. Nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Seconds and milliseconds</li>
        <li className="chip inline-flex">UTC and local time</li>
        <li className="chip inline-flex">Live current timestamp</li>
      </ul>

      <div className="mt-8">
        <UnixTimestampConverter />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A Unix timestamp converter turns an epoch value into a human-readable
          date and back again. Developers use these numbers in API payloads,
          log lines, JWT <code>iat</code> and <code>exp</code> claims, and
          database fields. Seconds since 1 January 1970 UTC are the usual
          form; JavaScript and many telemetry systems store milliseconds
          instead.
        </p>
        <p>
          Paste a 10-digit or 13-digit number and this page shows the matching
          instant in UTC, your local timezone, ISO 8601, and RFC 2822. Or pick
          a date and time and copy the Unix time in seconds or milliseconds.
          Negative values work for dates before 1970. The live clock at the
          top is computed in this tab, so it stays in sync with your device.
        </p>
        <p>
          Everything stays in the browser — no upload and no account. Need to
          pretty-print a payload that contains timestamps? Open the{" "}
          <Link className="text-mint underline" href="/dev/json-formatter">
            JSON formatter
          </Link>
          . Scheduling a job for a given instant? Use the{" "}
          <Link className="text-mint underline" href="/dev/cron-expression-generator">
            cron expression generator
          </Link>
          . To read <code>iat</code> and <code>exp</code> claims, try the{" "}
          <Link className="text-mint underline" href="/dev/jwt-decoder">
            JWT decoder
          </Link>
          . For calendar math, open the{" "}
          <Link className="text-mint underline" href="/finance/date-calculator">
            date calculator
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
          How to use the Unix timestamp converter
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Read or copy the live current timestamp in seconds or milliseconds.</li>
          <li>Paste a Unix value and leave Unit on Auto, or choose seconds or milliseconds.</li>
          <li>Check the UTC, local, ISO 8601, and RFC 2822 results, then copy what you need.</li>
          <li>To go the other way, pick a date and time and choose UTC or local time.</li>
          <li>Copy the seconds or milliseconds into your code, logs, or database. Nothing is stored.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
