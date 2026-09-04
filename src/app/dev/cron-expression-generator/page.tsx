import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { CronExpressionGenerator } from "@/components/tools/CronExpressionGenerator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/cron-expression-generator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "Cron Expression Generator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a cron expression generator?",
    answer:
      "A cron expression generator builds a standard 5-field crontab schedule (minute, hour, day-of-month, month, day-of-week). This page is also a cron maker: pick fields or a preset, read a human-readable summary, then copy the expression.",
  },
  {
    question: "What do the five cron fields mean?",
    answer:
      "In order: minute (0–59), hour (0–23), day of month (1–31), month (1–12 or JAN–DEC), and day of week (0–7 or SUN–SAT). 0 and 7 are both Sunday. Stars mean every value. Lists, ranges, and steps such as */15 are allowed.",
  },
  {
    question: "Does this cron maker run in my timezone?",
    answer:
      "The expression itself has no timezone. Cron daemons use the timezone of the host that runs them. The next-run preview on this page uses your browser’s local timezone so you can sanity-check the schedule before you paste it into crontab or a CI timer.",
  },
  {
    question: "What happens if both day-of-month and day-of-week are set?",
    answer:
      "This generator follows common Unix/Vixie cron: if both fields are restricted (not *), the job runs when either field matches. Example: 0 0 1 * 1 is midnight on the 1st of the month or on Mondays.",
  },
  {
    question: "Can I paste an existing cron expression?",
    answer:
      "Yes. Type or paste a 5-field expression into the Expression box, then leave the field. Valid expressions fill the five inputs. Six-field cron (with seconds) and Quartz-only tokens such as L or # are not supported.",
  },
  {
    question: "Is my schedule uploaded to a server?",
    answer:
      "No. Field values, presets, the generated expression, and next-run times are computed in your browser. Nothing is logged, stored, or uploaded.",
  },
];

export const metadata: Metadata = {
  title: "Cron Expression Generator — Free Online Cron Maker",
  description:
    "Free cron expression generator and cron maker. Build a 5-field crontab with presets, a human-readable summary, and upcoming run times, then copy the expression. Runs in your browser.",
  alternates: { canonical: href },
};

export default function CronExpressionGeneratorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        Cron Expression Generator
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Build a standard 5-field cron expression in your browser — presets,
        a human-readable summary, and a copyable crontab line. Nothing is uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">5-field cron</li>
        <li className="chip inline-flex">Presets</li>
        <li className="chip inline-flex">Next-run preview</li>
      </ul>

      <div className="mt-8">
        <CronExpressionGenerator />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A cron expression generator writes the five-field schedule used by
          crontab, CI timers, and many job queues. Searchers also call this a
          cron maker. Fill minute, hour, day-of-month, month, and day-of-week,
          or start from a preset such as hourly, daily at midnight, weekdays
          at 9am, or the first of the month.
        </p>
        <p>
          Stars mean every value. Use lists (<code>9,17</code>), ranges (
          <code>1-5</code>), and steps (<code>*/15</code>). Month and weekday
          names such as <code>JAN</code> and <code>MON</code> are accepted.
          The summary restates the schedule in plain language, and the next
          few run times are estimated in your local timezone.
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
          . For crawl rules, try the{" "}
          <Link className="text-mint underline" href="/seo/robots-txt-builder">
            robots.txt builder
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
          How to use the cron expression generator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick a preset, or type values into the five cron fields.</li>
          <li>Use *, lists, ranges, or steps. 0 and 7 are both Sunday.</li>
          <li>Optionally paste an existing 5-field expression into the Expression box.</li>
          <li>Read the human-readable summary and the next-run preview.</li>
          <li>Copy the expression into crontab, a workflow, or a scheduler config.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
