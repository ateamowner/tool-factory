import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { FaqSection } from "@/components/FaqSection";
import { JsonLd } from "@/components/JsonLd";
import { RelatedTools } from "@/components/RelatedTools";
import { JwtDecoder } from "@/components/tools/JwtDecoder";
import { breadcrumbJsonLd, faqPageJsonLd, type FaqItem } from "@/lib/faq-schema";
import { getSiteUrl } from "@/lib/site";

const href = "/dev/jwt-decoder";

const crumbs = [
  { name: "Home", href: "/" },
  { name: "Developer", href: "/dev" },
  { name: "JWT Decoder", href },
];

const faqs: FaqItem[] = [
  {
    question: "What is a JWT decoder?",
    answer:
      "A JWT decoder reads a JSON Web Token and shows the header and payload as JSON. This JWT token decoder splits the three base64url segments, then pretty-prints claims such as sub, iss, exp, and iat in your browser.",
  },
  {
    question: "Does this JWT decoder verify the signature?",
    answer:
      "No. Decoding is not verification. The page never checks HMAC, RSA, or any other signature, and it does not fetch keys. Treat the claims as unsigned data until your own app verifies the token.",
  },
  {
    question: "Is my JWT token sent to a server?",
    answer:
      "No. Paste stays in this tab. Header, payload, and signature bytes are decoded with base64url in your browser. We do not log, store, or upload tokens.",
  },
  {
    question: "Can a JWT token decoder read an expired token?",
    answer:
      "Yes. Expiration (exp) is just another claim. This decoder still shows expired or not-yet-valid tokens and formats exp, iat, and nbf as UTC timestamps. Validity is a verification step, not a decode step.",
  },
  {
    question: "What JWT formats does this decoder accept?",
    answer:
      "Unencrypted JWS tokens with two or three parts (header.payload or header.payload.signature). An optional Bearer prefix and extra whitespace are stripped. Encrypted JWTs (JWE, five parts) are not decoded.",
  },
];

export const metadata: Metadata = {
  title: "JWT Decoder — Free JWT Token Decoder (Client-Side)",
  description:
    "Free JWT decoder and JWT token decoder. Paste a token to read the header and payload as JSON. Base64url decode only — no signature check, nothing uploaded.",
  alternates: { canonical: href },
};

export default function JwtDecoderPage() {
  const siteUrl = getSiteUrl();

  return (
    <main id="main" className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <JsonLd data={breadcrumbJsonLd(crumbs, siteUrl)} />
      <Breadcrumbs items={crumbs} />
      <h1 className="mt-6 text-4xl font-[650] tracking-tight sm:text-5xl">
        JWT Decoder
      </h1>
      <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
        Decode a JWT token in your browser — header and payload as readable JSON,
        no signature check, nothing uploaded.
      </p>
      <ul className="mt-5 flex flex-wrap gap-2">
        <li className="chip inline-flex">Header + payload</li>
        <li className="chip inline-flex">Base64url only</li>
        <li className="chip inline-flex">Not verification</li>
      </ul>

      <div className="mt-8">
        <JwtDecoder />
      </div>

      <section className="mt-12 max-w-3xl space-y-4 text-[17px] leading-7 text-text/90">
        <p>
          A JWT decoder turns a compact JSON Web Token into the JSON objects
          inside it. Searchers also call this a JWT token decoder. Paste the
          string, and this page splits header, payload, and the unused
          signature segment, then base64url-decodes the first two parts.
        </p>
        <p>
          Claims stay as JSON so you can read <code>sub</code>,{" "}
          <code>iss</code>, <code>aud</code>, and the rest. Time fields{" "}
          <code>iat</code>, <code>exp</code>, and <code>nbf</code> also show as
          UTC timestamps. Decoding does not prove who signed the token or
          whether it is still valid.
        </p>
        <p>
          Everything runs locally with no network call. Use this when you need
          to inspect a token you already have — not to authenticate a user.
          Need identifiers for a test fixture? Open the{" "}
          <Link className="text-mint underline" href="/dev/uuid-generator">
            UUID generator
          </Link>
          . For campaign URLs, use the{" "}
          <Link className="text-mint underline" href="/seo/utm-builder">
            UTM builder
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
          How to use the JWT decoder
        </h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 leading-7">
          <li>Paste a JWT into the box. A Bearer prefix is optional.</li>
          <li>Read the header JSON (algorithm and type) and the payload claims.</li>
          <li>Scan formatted exp, iat, and nbf values if those claims are present.</li>
          <li>Copy the JSON if you need it in a ticket or local script.</li>
          <li>Do not treat a successful decode as proof the token is authentic.</li>
        </ol>
      </section>

      <FaqSection faqs={faqs} />
      <RelatedTools currentHref={href} />
    </main>
  );
}
