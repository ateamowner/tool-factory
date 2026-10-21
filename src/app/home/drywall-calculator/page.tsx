import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { DrywallCalculator } from "@/components/tools/DrywallCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/drywall-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Drywall Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate how much drywall I need?",
    answer:
      "Add the room's length and width, double it to get the perimeter, and multiply by the wall height. Add length × width if you are hanging the ceiling, subtract doors and windows, then divide by the area of one sheet and round up. A 12 × 12 ft room with 8 ft walls has 384 sq ft of wall, which is 12 sheets of 4 × 8.",
  },
  {
    question: "How many square feet are in a sheet of drywall?",
    answer:
      "A 4 × 8 ft sheet covers 32 square feet, a 4 × 10 ft sheet covers 40 square feet, and a 4 × 12 ft sheet covers 48 square feet. Larger sheets mean fewer seams to tape, but they are heavier and harder to carry and hang.",
  },
  {
    question: "Should I subtract doors and windows?",
    answer:
      "Yes for a closer count. A standard interior door is about 21 sq ft and a typical window is about 15 sq ft. Many installers skip the subtraction on small windows because offcuts are rarely reusable, so the extra board works as waste allowance.",
  },
  {
    question: "How much extra drywall should I buy for waste?",
    answer:
      "Plan on about 10% extra for simple rooms and 15% for rooms with many corners, angled ceilings, or lots of openings. The calculator adds the waste percent to the board area before it counts sheets, then rounds up to whole sheets.",
  },
  {
    question: "How much joint compound do I need?",
    answer:
      "A common rule of thumb is about 0.14 lb of ready-mixed all-purpose compound per square foot of board for a three-coat finish, or roughly 138 lb per 1,000 sq ft. A 4.5-gallon pail weighs about 62 lb, so 1,000 sq ft needs about 2 to 3 pails. Lightweight compound covers more per pail.",
  },
  {
    question: "How much drywall tape and how many screws do I need?",
    answer:
      "Plan on about 370 ft of paper tape per 1,000 sq ft of board, so one 500 ft roll covers a typical room. For screws, figure about one screw per square foot, which is about 32 screws per 4 × 8 sheet with framing 16 inches on center. Ceilings need slightly tighter spacing than walls.",
  },
  {
    question: "How many sheets of drywall do I need for a 12 × 12 room?",
    answer:
      "With 8 ft walls, the walls are 2 × (12 + 12) × 8 = 384 sq ft, or 12 sheets of 4 × 8. Adding the 144 sq ft ceiling brings it to 528 sq ft, and with 10% waste that is about 581 sq ft, or 19 sheets of 4 × 8 or 13 sheets of 4 × 12.",
  },
  {
    question: "How is this different from the square footage calculator?",
    answer:
      "The square footage calculator measures floor area of rooms and shapes. This drywall calculator works out wall and ceiling area from room size and wall height, then turns it into sheets, joint compound, tape, and screws. Use the square footage calculator first if you need the floor area of an odd-shaped room.",
  },
];

export const metadata: Metadata = {
  title: "Drywall Calculator — Sheets, Joint Compound, Tape & Screws",
  description:
    "Free drywall calculator. Enter room length, width, and wall height to get 4×8, 4×10, or 4×12 sheets for walls and ceiling, minus doors and windows, plus mud, tape, and screws.",
  alternates: { canonical: href },
};

export default function DrywallCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Drywall Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Figure out how many sheets of drywall you need for a room&apos;s walls and
        ceiling. Enter the room size and wall height, subtract doors and windows,
        pick 4 × 8, 4 × 10, or 4 × 12 sheets, and get a sheet count plus joint
        compound, tape, and screws. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Walls + ceiling</li>
        <li className="chip inline-flex">3 sheet sizes</li>
        <li className="chip inline-flex">Mud, tape, screws</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <DrywallCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Drywall is sold by the sheet, so the job is turning wall and ceiling
          area into a whole number of boards. Wall area is the room perimeter, 2
          × (length + width), times the wall height. The ceiling is length ×
          width. Subtract doors (about 21 sq ft each) and windows (about 15 sq ft
          each), add a waste allowance, divide by the sheet area, and round up.
        </p>
        <p>
          Example: a 12 × 12 ft bedroom with 8 ft walls has 384 sq ft of wall
          and a 144 sq ft ceiling. That is 528 sq ft, or 581 sq ft with 10%
          waste, so you need 19 sheets of 4 × 8 (32 sq ft each). The same room
          takes about 73 lb of joint compound, 2 pails, and one roll of tape.
        </p>
        <p>
          Need the floor area of an odd-shaped room first? Use the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>{" "}
          for rectangles, L-shapes, triangles, and circles. For slabs and
          footings, try the{" "}
          <Link className="text-mint underline" href="/home/concrete-calculator">
            concrete calculator
          </Link>
          , and for roof squares and waste, the{" "}
          <Link className="text-mint underline" href="/home/roofing-calculator">
            roofing calculator
          </Link>
          . Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning. Compound, tape, and screw amounts
          are rules of thumb; check the product label and your supplier before
          ordering.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the drywall calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Enter the room length, width, and wall height in feet.</li>
          <li>Leave &quot;Include the ceiling&quot; checked if you are hanging the ceiling too.</li>
          <li>Enter the number of doors and windows to subtract.</li>
          <li>Add any extra area, such as a closet or soffit, in square feet.</li>
          <li>Pick a sheet size and a waste percent (10% is typical).</li>
          <li>Read the sheet count, joint compound, tape, and screws.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
