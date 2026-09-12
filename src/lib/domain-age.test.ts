import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  SAMPLE_WHOIS,
  calculateDomainAge,
  extractRdapRecord,
  fetchRdapDomain,
  formatDomainAge,
  normalizeDomain,
  parseFlexibleDate,
  parseWhoisOrRdapText,
  rdapLookupUrls,
  summarizeDomainAge,
} from "./domain-age.ts";

const asOf = new Date(Date.UTC(2026, 8, 12));

describe("normalizeDomain", () => {
  it("strips protocol, path, query, port, and optional www", () => {
    assert.deepEqual(normalizeDomain("https://www.example.com/path?q=1#hash"), {
      ok: true,
      domain: "example.com",
      reason: "Domain looks usable.",
    });
    assert.equal(normalizeDomain("HTTP://WWW.Example.COM/").domain, "example.com");
    assert.equal(normalizeDomain("//example.com/foo").domain, "example.com");
    assert.equal(normalizeDomain("example.com:443/login").domain, "example.com");
    assert.equal(normalizeDomain("  example.com.  ").domain, "example.com");
  });

  it("can keep www when the toggle is off", () => {
    assert.equal(
      normalizeDomain("https://www.example.com", { stripWww: false }).domain,
      "www.example.com",
    );
  });

  it("reads a domain from an email and rejects junk", () => {
    assert.equal(normalizeDomain("mailto:ops@example.com").domain, "example.com");
    assert.equal(normalizeDomain("ops@example.com").ok, true);
    assert.equal(normalizeDomain("   ").ok, false);
    assert.equal(normalizeDomain("not a domain").ok, false);
    assert.equal(normalizeDomain("localhost").ok, false);
    assert.equal(normalizeDomain("10.0.0.1").ok, false);
  });
});

describe("parseFlexibleDate", () => {
  it("reads ISO, WHOIS, and compact date shapes", () => {
    assert.equal(parseFlexibleDate("1995-08-14T04:00:00Z")?.toISOString(), "1995-08-14T04:00:00.000Z");
    assert.equal(parseFlexibleDate("1995-08-14")?.toISOString().slice(0, 10), "1995-08-14");
    assert.equal(parseFlexibleDate("14-Aug-1995")?.toISOString().slice(0, 10), "1995-08-14");
    assert.equal(parseFlexibleDate("August 14, 1995")?.toISOString().slice(0, 10), "1995-08-14");
    assert.equal(parseFlexibleDate("19950814")?.toISOString().slice(0, 10), "1995-08-14");
    assert.equal(parseFlexibleDate("08/14/1995")?.toISOString().slice(0, 10), "1995-08-14");
    assert.equal(parseFlexibleDate("not-a-date"), null);
  });
});

describe("calculateDomainAge", () => {
  it("returns years, months, days, and total days from UTC dates", () => {
    const created = new Date(Date.UTC(2020, 0, 15));
    const age = calculateDomainAge(created, asOf);
    assert.deepEqual(age, {
      years: 6,
      months: 7,
      days: 28,
      totalDays: 2432,
    });
    assert.equal(formatDomainAge(age!), "6 years, 7 months, 28 days");
  });

  it("handles a same-day registration and a future date", () => {
    const sameDay = new Date(Date.UTC(2026, 8, 12));
    assert.deepEqual(calculateDomainAge(sameDay, asOf), {
      years: 0,
      months: 0,
      days: 0,
      totalDays: 0,
    });
    assert.equal(formatDomainAge({ years: 0, months: 0, days: 0, totalDays: 0 }), "0 days");
    assert.equal(formatDomainAge({ years: 1, months: 0, days: 0, totalDays: 365 }), "1 year");
    assert.equal(
      calculateDomainAge(new Date(Date.UTC(2027, 0, 1)), asOf),
      null,
    );
  });
});

describe("parseWhoisOrRdapText", () => {
  it("parses common WHOIS creation, expiry, and registrar fields", () => {
    const record = parseWhoisOrRdapText(SAMPLE_WHOIS);
    assert.equal(record.domain, "example.com");
    assert.equal(record.created?.toISOString(), "1995-08-14T04:00:00.000Z");
    assert.equal(record.expires?.toISOString(), "2026-08-13T04:00:00.000Z");
    assert.equal(record.registrar, "RESERVED-Internet Assigned Numbers Authority");
  });

  it("reads alternate labels and ignores registrar URL / IANA lines", () => {
    const record = parseWhoisOrRdapText(`
Domain Name: example.org
created: 14-Sep-2001
Expires On: 2001-09-14
Registrar URL: https://example-registrar.test
Registrar IANA ID: 123
Registrar: Example Registrar, Inc.
`);
    assert.equal(record.created?.toISOString().slice(0, 10), "2001-09-14");
    assert.equal(record.expires?.toISOString().slice(0, 10), "2001-09-14");
    assert.equal(record.registrar, "Example Registrar, Inc.");
  });

  it("parses pasted RDAP JSON events", () => {
    const record = parseWhoisOrRdapText(
      JSON.stringify({
        ldhName: "EXAMPLE.NET",
        events: [
          { eventAction: "registration", eventDate: "1995-08-14T04:00:00Z" },
          { eventAction: "expiration", eventDate: "2027-08-13T04:00:00Z" },
        ],
        entities: [
          {
            roles: ["registrar"],
            vcardArray: ["vcard", [["fn", {}, "text", "Example Registrar"]]],
          },
        ],
      }),
    );
    assert.equal(record.domain, "example.net");
    assert.equal(record.createdRaw, "1995-08-14T04:00:00Z");
    assert.equal(record.expiresRaw, "2027-08-13T04:00:00Z");
    assert.equal(record.registrar, "Example Registrar");
  });

  it("returns empty fields for blank or unmatched text", () => {
    assert.equal(parseWhoisOrRdapText("   ").created, null);
    assert.equal(parseWhoisOrRdapText("Status: clientTransferProhibited").created, null);
  });
});

describe("extractRdapRecord", () => {
  it("walks nested registrar entities", () => {
    const record = extractRdapRecord({
      unicodeName: "Example.COM",
      events: [{ eventAction: "created", eventDate: "1995-08-14T04:00:00Z" }],
      entities: [
        {
          roles: ["registrant"],
          entities: [
            {
              roles: ["registrar"],
              vcardArray: ["vcard", [["fn", {}, "text", "Nested Registrar"]]],
            },
          ],
        },
      ],
    });
    assert.equal(record.domain, "example.com");
    assert.equal(record.registrar, "Nested Registrar");
    assert.equal(record.created?.toISOString().slice(0, 10), "1995-08-14");
  });
});

describe("summarizeDomainAge", () => {
  it("builds age labels and an RDAP source note", () => {
    const summary = summarizeDomainAge(
      parseWhoisOrRdapText(SAMPLE_WHOIS),
      "rdap",
      asOf,
    );
    assert.equal(summary.ok, true);
    assert.equal(summary.ageLabel, "31 years, 29 days");
    assert.match(summary.sourceNote, /public RDAP endpoint/i);
    assert.equal(summary.createdLabel, "August 14, 1995");
  });

  it("explains a missing creation date for pasted text", () => {
    const summary = summarizeDomainAge(
      parseWhoisOrRdapText("Registrar: Example Registrar, Inc."),
      "pasted",
      asOf,
    );
    assert.equal(summary.ok, false);
    assert.match(summary.reason, /No creation/);
    assert.match(summary.sourceNote, /stayed in this tab/i);
  });
});

describe("rdapLookupUrls and fetchRdapDomain", () => {
  it("starts at rdap.org and adds a Verisign URL for .com", () => {
    const urls = rdapLookupUrls("example.com");
    assert.equal(urls[0], "https://rdap.org/domain/example.com");
    assert.ok(urls.includes("https://rdap.verisign.com/com/v1/domain/example.com"));
  });

  it("uses the first successful public RDAP response", async () => {
    const fetchImpl = async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("rdap.org")) {
        throw new TypeError("Failed to fetch");
      }
      return new Response(
        JSON.stringify({
          ldhName: "example.com",
          events: [{ eventAction: "registration", eventDate: "1995-08-14T04:00:00Z" }],
        }),
        { status: 200, headers: { "content-type": "application/rdap+json" } },
      );
    };

    const result = await fetchRdapDomain("example.com", fetchImpl);
    assert.equal(result.ok, true);
    assert.equal(result.record?.created?.toISOString().slice(0, 10), "1995-08-14");
    assert.match(String(result.endpoint), /verisign/);
  });

  it("reports a CORS-style failure after every endpoint errors", async () => {
    const result = await fetchRdapDomain("example.com", async () => {
      throw new TypeError("Failed to fetch");
    });
    assert.equal(result.ok, false);
    assert.match(result.reason, /CORS|Paste a WHOIS/i);
  });
});

describe("FAQPage JSON-LD shape for domain age checker", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is a domain age checker?",
        answer:
          "A domain age checker looks up a domain’s registration or creation date and reports how old the name is in years, months, and days.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
