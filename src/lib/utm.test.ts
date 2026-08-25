import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyNamingRules,
  buildUtmCsv,
  buildUtmUrl,
  parseCsv,
  rowsToUtmFields,
} from "./utm.ts";

describe("utm helpers", () => {
  it("lowercases and turns spaces into underscores", () => {
    assert.equal(applyNamingRules("  Summer Sale 2026 "), "summer_sale_2026");
  });

  it("builds a campaign URL from a destination without a protocol", () => {
    const { url, error } = buildUtmUrl({
      destination: "example.com/landing",
      source: "Google Ads",
      medium: "cpc",
      campaign: "Spring Launch",
      term: "buy now",
      content: "hero banner",
      id: "cmp-1",
    });

    assert.equal(error, undefined);
    const parsed = new URL(url);
    assert.equal(parsed.protocol, "https:");
    assert.equal(parsed.hostname, "example.com");
    assert.equal(parsed.pathname, "/landing");
    assert.equal(parsed.searchParams.get("utm_source"), "google_ads");
    assert.equal(parsed.searchParams.get("utm_medium"), "cpc");
    assert.equal(parsed.searchParams.get("utm_campaign"), "spring_launch");
    assert.equal(parsed.searchParams.get("utm_term"), "buy_now");
    assert.equal(parsed.searchParams.get("utm_content"), "hero_banner");
    assert.equal(parsed.searchParams.get("utm_id"), "cmp-1");
  });

  it("parses a headered CSV into UTM fields", () => {
    const csv = `url,utm_source,utm_medium,utm_campaign
https://a.com, newsletter, email, welcome
https://b.com,google,cpc,brand`;
    const { headers, rows } = parseCsv(csv);
    const fields = rowsToUtmFields(headers, rows);
    assert.equal(fields.length, 2);
    assert.equal(fields[0].destination, "https://a.com");
    assert.equal(fields[0].source, "newsletter");
    assert.equal(fields[1].campaign, "brand");
  });

  it("exports a CSV with a final_url column", () => {
    const csv = buildUtmCsv([
      {
        destination: "https://a.com",
        source: "meta",
        medium: "paid_social",
        campaign: "q1",
        final_url: "https://a.com?utm_source=meta&utm_medium=paid_social&utm_campaign=q1",
      },
    ]);
    assert.match(csv, /final_url/);
    assert.match(csv, /utm_source=meta/);
  });
});
