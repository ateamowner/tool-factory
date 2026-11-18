import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { VolumeCalculator } from "@/components/tools/VolumeCalculator";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/math/volume-calculator";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Math", href: "/math" },
  { name: "Volume Calculator", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is volume?",
    answer:
      "Volume is the amount of three-dimensional space a solid takes up. It is measured in cubic units such as cubic feet (ft³), cubic meters (m³) or liters. A box 2 ft long, 3 ft wide and 4 ft high holds 24 ft³.",
  },
  {
    question: "How do I use this volume calculator?",
    answer:
      "Pick a shape, pick a unit, and enter each dimension in that unit. The calculator returns the volume in cubic units and also in cubic meters, liters, US gallons, cubic feet, cubic yards, cubic inches and cubic centimeters.",
  },
  {
    question: "What is the volume formula for a rectangular prism or cube?",
    answer:
      "A rectangular prism is length × width × height. A cube is the special case where all sides match, so the volume is side³. A 3 ft cube holds 27 ft³, which is exactly 1 cubic yard.",
  },
  {
    question: "How do I find the volume of a cylinder?",
    answer:
      "Use V = π r² h, where r is the radius and h is the height. A cylinder with radius 2 and height 5 has a volume of π × 4 × 5 = 62.83 cubic units. If you only know the diameter, halve it first.",
  },
  {
    question: "How do I find the volume of a sphere?",
    answer:
      "Use V = (4/3) π r³. A sphere with radius 3 has a volume of (4/3) × π × 27 = 113.10 cubic units. The volume grows with the cube of the radius, so doubling the radius makes the volume 8 times larger.",
  },
  {
    question: "What are the volume formulas for a cone and a pyramid?",
    answer:
      "A cone is one third of a cylinder with the same base and height: V = (1/3) π r² h. A pyramid is one third of a prism: V = (1/3) × base length × base width × height. A cone with radius 3 and height 4 holds 12π, about 37.70 cubic units.",
  },
  {
    question: "How do I convert cubic feet, cubic meters and liters?",
    answer:
      "One cubic meter is 1,000 liters, about 35.315 cubic feet and about 1.308 cubic yards. One cubic foot is about 7.481 US gallons or 28.317 liters. The result panel does these conversions for you. For yard-based material orders, use the cubic yard calculator.",
  },
  {
    question: "Why must every dimension use the same unit?",
    answer:
      "Volume multiplies lengths together, so mixing inches and feet gives a wrong answer. Convert everything to one unit first, or use the unit switcher and enter all dimensions in that unit. The result is then in that unit cubed.",
  },
  {
    question: "Is my data saved or uploaded?",
    answer:
      "No. The volume calculator runs entirely in your browser. Your numbers are not sent to a server or stored, and there is no account.",
  },
];

export const metadata: Metadata = {
  title: "Volume Calculator — Cube, Prism, Cylinder, Sphere, Cone",
  description:
    "Free volume calculator for a cube, rectangular prism, cylinder, sphere, cone and pyramid. Switch between mm, cm, m, in, ft and yd and see liters, gallons and cubic yards. Runs in your browser.",
  alternates: { canonical: href },
};

export default function VolumeCalculatorPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">Volume Calculator</h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Find the volume of a cube, rectangular prism, cylinder, sphere, cone or
        pyramid. Choose a unit, enter the dimensions, and this volume calculator
        returns the answer in cubic units plus liters, gallons, cubic feet, cubic
        yards and more. Everything runs in the browser.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">6 common shapes</li>
        <li className="chip inline-flex">mm, cm, m, in, ft, yd</li>
        <li className="chip inline-flex">Liters and gallons</li>
        <li className="chip inline-flex">Stays on your device</li>
      </ul>

      <div className="mt-8">
        <VolumeCalculator />
      </div>

      <section className="prose-tool mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <h2 className="text-2xl font-semibold tracking-tight text-text">Volume formulas</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 leading-7">
          <li>Cube: V = s³</li>
          <li>Rectangular prism: V = l × w × h</li>
          <li>Cylinder: V = π r² h</li>
          <li>Sphere: V = (4/3) π r³</li>
          <li>Cone: V = (1/3) π r² h</li>
          <li>Pyramid: V = (1/3) × base length × base width × height</li>
        </ul>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Worked example</h2>
        <p>
          A tank is a cylinder with a radius of 2 ft and a height of 5 ft. Its
          volume is π × 2² × 5 = 62.83 ft³. That is about 470 US gallons or
          1,779 liters. A sphere with a 3 ft radius is (4/3) × π × 27 = 113.10
          ft³, and a cone with the same radius and a 4 ft height is 37.70 ft³.
        </p>
        <h2 className="text-2xl font-semibold tracking-tight text-text">Ordering material by the cubic yard</h2>
        <p>
          This page gives the geometry. If you are ordering mulch, soil, gravel
          or concrete, the{" "}
          <Link className="text-mint underline" href="/convert/cubic-yard-calculator">
            cubic yard calculator
          </Link>{" "}
          turns length, width and depth into cubic yards and bag counts. For a
          circle&apos;s edge and area, use the{" "}
          <Link className="text-mint underline" href="/math/circumference-calculator">
            circumference calculator
          </Link>
          , and to work out a radius from a squared value, the{" "}
          <Link className="text-mint underline" href="/math/square-root-calculator">
            square root calculator
          </Link>
          . Powers like r³ can be checked with the{" "}
          <Link className="text-mint underline" href="/math/exponent-calculator">
            exponent calculator
          </Link>
          , and very large or small results can be rewritten with the{" "}
          <Link className="text-mint underline" href="/math/scientific-notation-calculator">
            scientific notation calculator
          </Link>
          .
        </p>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
