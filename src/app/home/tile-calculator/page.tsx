import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { TileCalculator } from "@/components/tools/TileCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/home/tile-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Household", href: "/home" },
  { name: "Tile Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "How do I calculate how many tiles I need?",
    answer:
      "Multiply the floor or wall length by its width to get square feet, then add 10% for cuts and breakage. Find how many square feet one tile covers by multiplying its length and width in inches (plus the grout gap) and dividing by 144. Divide the area with waste by the tile coverage and round up.",
  },
  {
    question: "How many 12 × 12 tiles do I need for 100 square feet?",
    answer:
      "A 12 × 12 in tile covers 1 square foot, so 100 sq ft needs 100 tiles before waste. With 10% waste that is 110 tiles. A 1/8 in grout joint makes each tile cover slightly more, so the count drops to about 108.",
  },
  {
    question: "How much extra tile should I buy?",
    answer:
      "Buy about 10% extra for a straight grid layout and 15% to 20% for diagonal, herringbone, or rooms with many corners and cuts. Large-format tile also breaks more often, so lean toward the higher figure. Keeping a few spare tiles from the same lot helps with future repairs.",
  },
  {
    question: "Does the grout gap change how much tile I need?",
    answer:
      "Yes, a little. Each grout joint adds width to every tile's footprint, so wider joints mean fewer tiles. With small mosaics or wide joints the difference can be several percent; with large tiles and 1/16 in joints it is tiny. Enter 0 to ignore grout.",
  },
  {
    question: "How many boxes of tile do I need?",
    answer:
      "Divide the number of tiles by the tiles per box printed on the carton and round up. Many boxes list square feet per box instead; divide your area with waste by that figure and round up. Stores usually sell only full boxes.",
  },
  {
    question: "How do I measure a room with an odd shape for tile?",
    answer:
      "Split the room into rectangles, find each area, and add them up. The square footage calculator can total several shapes for you; enter that total here in total square feet mode and use a higher waste percent for lots of cuts.",
  },
  {
    question: "How do I calculate tile for a shower wall or backsplash?",
    answer:
      "Measure each wall's width and height in feet, multiply, and add the walls together. Subtract large openings like windows or niches only if they are bigger than a few tiles. Enter the total area, your tile size, and grout gap to get tiles and boxes.",
  },
  {
    question: "How is this different from the square footage calculator?",
    answer:
      "The square footage calculator measures the area of rooms and shapes. This tile calculator takes an area and turns it into a tile count and boxes using your tile size, grout gap, waste percent, and box size.",
  },
];

export const metadata: Metadata = {
  title: "Tile Calculator — How Many Tiles & Boxes Do I Need?",
  description:
    "Free tile calculator. Enter room length and width or square feet, tile size, grout gap, and waste percent to get the number of tiles and boxes for a floor, wall, or backsplash.",
  alternates: { canonical: href },
};

export default function TileCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Tile Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Work out how many tiles and boxes to buy for a floor, shower wall, or
        backsplash. Enter the length and width or the total square feet, the
        tile size, grout gap, and a waste percent. Everything runs in the
        browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Tiles + boxes</li>
        <li className="chip inline-flex">Any tile size</li>
        <li className="chip inline-flex">Grout gap + waste</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <TileCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          Tile is bought by the piece or the box, so the job is turning an area
          into whole tiles. Multiply length × width for square feet, add a waste
          allowance, then divide by the area one tile covers: tile length ×
          width in inches, each plus the grout gap, divided by 144. Round up,
          then divide by tiles per box and round up again.
        </p>
        <p>
          Example: a 10 × 12 ft bathroom floor is 120 sq ft, or 132 sq ft with
          10% waste. A 12 × 12 in tile with a 1/8 in grout joint covers about
          1.02 sq ft, so you need 130 tiles. At 10 tiles per box, buy 13 boxes.
        </p>
        <p>
          Room shaped like an L? Measure each part with the{" "}
          <Link className="text-mint underline" href="/home/square-footage-calculator">
            square footage calculator
          </Link>{" "}
          and enter the total here. Pouring a new slab before tiling? Use the{" "}
          <Link className="text-mint underline" href="/home/concrete-calculator">
            concrete calculator
          </Link>
          , and for walls that need new board first, the{" "}
          <Link className="text-mint underline" href="/home/drywall-calculator">
            drywall calculator
          </Link>
          . Browse more tools on the{" "}
          <Link className="text-mint underline" href="/home">
            Household
          </Link>{" "}
          hub.
        </p>
        <p>
          Results are estimates for planning. Tile sizes are nominal and box
          counts vary by product; check the carton before you buy.
        </p>
      </section>

      <section className="mt-12 max-w-3xl" aria-labelledby="howto-heading">
        <h2 id="howto-heading" className="text-2xl font-semibold tracking-tight text-text">
          How to use the tile calculator
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Pick length × width or total square feet.</li>
          <li>Enter the floor or wall size.</li>
          <li>Enter the tile length and width in inches and the grout gap.</li>
          <li>Set a waste percent (10% for straight layouts, 15% or more for diagonal).</li>
          <li>Enter tiles per box from the carton and read the tiles and boxes to buy.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
