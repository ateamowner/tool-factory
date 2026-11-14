import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { WallpaperCalculator } from "@/components/tools/WallpaperCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/wallpaper-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Wallpaper Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How much wallpaper do I need?",
    answer:
      "Measure the room's length, width, and wall height, then work out the wall area: 2 × (length + width) × height. Subtract doors and windows, divide by the area one strip covers (roll width × strip length), add 10% for waste, and divide by the strips each roll yields. A 12 × 12 ft room with 8 ft walls, one door and two windows needs about 7 US single rolls.",
  },
  {
    question: "How do I calculate wallpaper rolls for a room?",
    answer:
      "Cut the walls into vertical strips. Strips needed = wall area ÷ (roll width × strip length). Strips per roll = roll length ÷ strip length, rounded down. Rolls = strips ÷ strips per roll, rounded up. Rounding down the strips per roll matters because the leftover piece at the end of a roll is usually too short for a full drop.",
  },
  {
    question: "Should I subtract doors and windows?",
    answer:
      "Yes, for a closer count. A standard door is about 21 sq ft and a typical window is about 15 sq ft. If you are matching a pattern, buy a little extra anyway: strips above doors and below windows still need a full-length cut.",
  },
  {
    question: "What is a pattern repeat and how does it change the number of rolls?",
    answer:
      "The repeat is the vertical distance before the pattern starts over, printed on the roll label. To line up neighboring strips, each strip is cut to a whole number of repeats, so an 8 ft wall with an 18 in repeat uses 9 ft strips. Longer strips mean fewer strips per roll, so patterned paper usually needs more rolls than a plain or random-match paper.",
  },
  {
    question: "How much extra wallpaper should I buy for waste?",
    answer:
      "Plan on about 10% extra for plain or random-match paper and 15% or more for large repeats, angled walls, or lots of corners. Buy all rolls in the same batch so the color matches, and keep a spare roll for repairs.",
  },
  {
    question: "What are the standard wallpaper roll sizes?",
    answer:
      "A US single roll is typically 20.5 in wide and 33 ft long, sold as a double roll of 66 ft. European rolls are 21 in (53 cm) wide and 10.05 m (33 ft) long. Wide and commercial papers are often 27 in wide, so use the custom option and enter the width and length on the label.",
  },
  {
    question: "Can I enter the room in meters?",
    answer:
      "Yes. Switch the units to meters and the calculator converts to feet internally (1 m = 3.28084 ft). The roll size options use inches and feet, and the result is the same whichever unit you pick.",
  },
  {
    question: "How is this different from the square footage and drywall calculators?",
    answer:
      "The square footage calculator gives the area of a room or shape, and the drywall calculator turns wall and ceiling area into sheets. This tool adds roll width, strip length, and pattern repeat to count rolls of wallpaper. Roll counts are estimates, so check the label and ask your supplier before ordering.",
  },
];

export const metadata: Metadata = {
  title: "Wallpaper Calculator — How Many Rolls Do I Need?",
  description:
    "Free wallpaper calculator. Enter room walls in feet or meters, subtract doors and windows, add roll size, pattern repeat, and waste % to see how much wallpaper you need in rolls.",
  alternates: { canonical: href },
};

export default function WallpaperCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Wallpaper Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Wondering how much wallpaper you need? Enter the room&apos;s length, width, and
        wall height in feet or meters, subtract doors and windows, pick a roll size,
        and add the pattern repeat and a waste percent. You get the number of rolls to
        buy. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Feet or meters</li>
        <li className="chip inline-flex">Pattern repeat</li>
        <li className="chip inline-flex">Doors and windows</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <WallpaperCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Wallpaper is sold by the roll, but it is hung in vertical strips, so the
          job is turning wall area into a whole number of strips and then rolls. Wall
          area is the room perimeter, 2 × (length + width), times the wall height.
          Subtract doors (about 21 sq ft each) and windows (about 15 sq ft each),
          divide by the area one strip covers, add waste, and divide by the strips
          each roll gives you.
        </p>
        <p>
          Example: a 12 × 12 ft room with 8 ft walls has 384 sq ft of wall. One door
          and two windows take off 51 sq ft, leaving 333 sq ft. A 20.5 in × 8 ft
          strip covers about 13.7 sq ft, so you need 25 strips, or 28 with 10% waste.
          A 33 ft roll yields 4 strips of 8 ft, so that is 7 rolls.
        </p>
        <p>
          Need the room area first? Use the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>
          . Replacing damaged walls before papering? The{" "}
          <Link className="text-mint underline" href="/home/drywall-calculator">
            drywall calculator
          </Link>{" "}
          turns room size into sheets and joint compound, and the{" "}
          <Link className="text-mint underline" href="/home/tile-calculator">
            tile calculator
          </Link>{" "}
          does the same for tile. Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning. Check the roll label for width, length,
          and repeat, and confirm quantities with your supplier before ordering.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the wallpaper calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Choose feet or meters and enter the room length, width, and wall height.</li>
          <li>Enter the number of doors and windows to subtract.</li>
          <li>Pick your roll size, or choose custom and enter the width and length from the label.</li>
          <li>Enter the pattern repeat in inches, or 0 for a plain or random-match paper.</li>
          <li>Set a waste percent (10% is typical).</li>
          <li>Read the number of rolls, strips, and strip length.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
