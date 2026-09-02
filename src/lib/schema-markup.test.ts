import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { extractJsonLdTexts, prettyPrintJsonLd, validateSchemaMarkup } from "./schema-markup.ts";

const VALID_FAQ = `{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is a schema markup validator?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It checks JSON-LD structure in your browser."
      }
    }
  ]
}`;

describe("validateSchemaMarkup", () => {
  it("accepts a complete FAQPage and pretty-prints it", () => {
    const result = validateSchemaMarkup(VALID_FAQ);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.errorCount, 0);
    assert.equal(result.source, "json");
    assert.ok(result.nodes.some((node) => node.type === "FAQPage"));
    assert.ok(result.nodes.some((node) => node.type === "Question"));
    assert.match(result.pretty, /"@type": "FAQPage"/);
    assert.equal(prettyPrintJsonLd('{"@context":"https://schema.org","@type":"WebSite","name":"A"}'), [
      "{",
      '  "@context": "https://schema.org",',
      '  "@type": "WebSite",',
      '  "name": "A"',
      "}",
    ].join("\n"));
  });

  it("extracts JSON-LD from script tags", () => {
    const html = `
      <script type="application/ld+json">
        {"@context":"https://schema.org","@type":"Organization","name":"Tool Factory"}
      </script>
    `;
    const extracted = extractJsonLdTexts(html);
    assert.equal(extracted.source, "html");
    assert.equal(extracted.texts.length, 1);
    const result = validateSchemaMarkup(html);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.source, "html");
    assert.equal(result.scriptCount, 1);
    assert.equal(result.errorCount, 0);
  });

  it("flags missing @context and @type, and type/context lookalikes", () => {
    const missing = validateSchemaMarkup("{}");
    assert.equal(missing.ok, true);
    if (!missing.ok) return;
    assert.ok(missing.issues.some((issue) => issue.message.includes("Missing @context")));
    assert.ok(missing.issues.some((issue) => issue.message.includes("Missing @type")));

    const lookalike = validateSchemaMarkup('{"context":"https://schema.org","type":"Product"}');
    assert.equal(lookalike.ok, true);
    if (!lookalike.ok) return;
    assert.ok(lookalike.issues.some((issue) => issue.message.includes('"type"')));
    assert.ok(lookalike.issues.some((issue) => issue.message.includes('"context"')));
  });

  it("walks @graph nodes and warns on recommended fields", () => {
    const result = validateSchemaMarkup(`{
      "@context": "https://schema.org",
      "@graph": [
        { "@type": "Organization" },
        { "@type": "WebSite", "name": "Example" }
      ]
    }`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.nodes.some((node) => node.type === "Organization"));
    assert.ok(result.nodes.some((node) => node.type === "WebSite"));
    assert.ok(
      result.issues.some(
        (issue) => issue.severity === "warning" && issue.message.includes("Organization is stronger"),
      ),
    );
  });

  it("rejects empty input and invalid JSON with a trailing-comma hint", () => {
    assert.equal(validateSchemaMarkup("").ok, false);
    const trailing = validateSchemaMarkup('{"@type":"Thing",}');
    assert.equal(trailing.ok, false);
    if (trailing.ok) return;
    assert.match(trailing.error, /trailing comma/i);
  });

  it("warns when FAQ is used instead of FAQPage", () => {
    const result = validateSchemaMarkup('{"@context":"https://schema.org","@type":"FAQ"}');
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.ok(result.issues.some((issue) => issue.message.includes("FAQPage")));
  });
});
