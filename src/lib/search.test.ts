import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { indexToolsAndHubs, searchSite } from "./search.ts";
import { CATEGORIES, TOOLS } from "./tools.ts";

const catalog = indexToolsAndHubs(CATEGORIES, TOOLS);

describe("searchSite", () => {
  it("indexes the published tools and five hubs", () => {
    assert.equal(catalog.filter((item) => item.kind === "tool").length, TOOLS.length);
    assert.equal(catalog.filter((item) => item.kind === "hub").length, 5);
    assert.deepEqual(
      catalog.filter((item) => item.kind === "tool").map((item) => item.href).sort(),
      TOOLS.map((tool) => tool.href).sort(),
    );
    assert.ok(
      catalog.some((item) => item.href === "/finance/paycheck-calculator-hourly"),
    );
    assert.ok(catalog.some((item) => item.href === "/seo/robots-txt-builder"));
    assert.ok(catalog.some((item) => item.href === "/seo/domain-age-checker"));
  });

  it("jumps to UTM Builder from generator aliases", () => {
    const hits = searchSite("utm generator", catalog);
    assert.equal(hits[0]?.href, "/seo/utm-builder");
  });

  it("finds hubs and tools from short queries", () => {
    assert.equal(searchSite("seo", catalog)[0]?.href, "/seo");
    assert.ok(
      searchSite("uuid", catalog).some((hit) => hit.href === "/dev/uuid-generator"),
    );
    assert.equal(searchSite("jwt decoder", catalog)[0]?.href, "/dev/jwt-decoder");
    assert.equal(
      searchSite("cron expression generator", catalog)[0]?.href,
      "/dev/cron-expression-generator",
    );
    assert.equal(
      searchSite("cron maker", catalog)[0]?.href,
      "/dev/cron-expression-generator",
    );
    assert.equal(
      searchSite("jwt token decoder", catalog)[0]?.href,
      "/dev/jwt-decoder",
    );
    assert.equal(
      searchSite("paycheck calculator hourly", catalog)[0]?.href,
      "/finance/paycheck-calculator-hourly",
    );
    assert.equal(
      searchSite("robot.txt generator", catalog)[0]?.href,
      "/seo/robots-txt-builder",
    );
    assert.equal(searchSite("", catalog).length, 0);
    assert.equal(searchSite("convert", catalog)[0]?.href, "/convert");
    assert.equal(
      searchSite("heic to png converter", catalog)[0]?.href,
      "/convert/heic-to-png",
    );
    assert.equal(
      searchSite("heic to pdf converter", catalog)[0]?.href,
      "/convert/heic-to-pdf",
    );
    assert.equal(
      searchSite("excel to pdf converter", catalog)[0]?.href,
      "/convert/excel-to-pdf",
    );
    assert.equal(searchSite("png to jpg", catalog)[0]?.href, "/convert/png-to-jpg");
    assert.equal(
      searchSite("png to jpg converter", catalog)[0]?.href,
      "/convert/png-to-jpg",
    );
    assert.equal(
      searchSite("convert png to jpg", catalog)[0]?.href,
      "/convert/png-to-jpg",
    );
    assert.equal(
      searchSite("emergency fund calculator", catalog)[0]?.href,
      "/finance/emergency-fund-calculator",
    );
    assert.equal(
      searchSite("mortgage recast calculator", catalog)[0]?.href,
      "/finance/mortgage-recast-calculator",
    );
    assert.equal(
      searchSite("recast mortgage calculator", catalog)[0]?.href,
      "/finance/mortgage-recast-calculator",
    );
    assert.equal(
      searchSite("refinance calculator auto loan", catalog)[0]?.href,
      "/finance/auto-loan-refinance-calculator",
    );
    assert.equal(
      searchSite("auto refinance calculator", catalog)[0]?.href,
      "/finance/auto-loan-refinance-calculator",
    );
    assert.equal(
      searchSite("car loan refinance calculator", catalog)[0]?.href,
      "/finance/auto-loan-refinance-calculator",
    );
    assert.equal(
      searchSite("real estate commission calculator", catalog)[0]?.href,
      "/finance/real-estate-commission-calculator",
    );
    assert.equal(
      searchSite("realtor commission calculator", catalog)[0]?.href,
      "/finance/real-estate-commission-calculator",
    );
    assert.equal(
      searchSite("home sale commission calculator", catalog)[0]?.href,
      "/finance/real-estate-commission-calculator",
    );
    assert.equal(
      searchSite("403b calculator", catalog)[0]?.href,
      "/finance/403b-calculator",
    );
    assert.equal(
      searchSite("403b contribution calculator", catalog)[0]?.href,
      "/finance/403b-calculator",
    );
    assert.equal(
      searchSite("403 b calculator", catalog)[0]?.href,
      "/finance/403b-calculator",
    );
    assert.equal(
      searchSite("monthly budget template", catalog)[0]?.href,
      "/finance/monthly-budget-template",
    );
    assert.equal(
      searchSite("monthly budget planner", catalog)[0]?.href,
      "/finance/monthly-budget-template",
    );
    assert.equal(
      searchSite("budget template monthly", catalog)[0]?.href,
      "/finance/monthly-budget-template",
    );
    assert.equal(
      searchSite("schema markup validator", catalog)[0]?.href,
      "/seo/schema-markup-validator",
    );
    assert.equal(
      searchSite("schema checker", catalog)[0]?.href,
      "/seo/schema-markup-validator",
    );
    assert.equal(
      searchSite("domain age checker", catalog)[0]?.href,
      "/seo/domain-age-checker",
    );
    assert.equal(
      searchSite("check domain age", catalog)[0]?.href,
      "/seo/domain-age-checker",
    );
    assert.equal(
      searchSite("website age checker", catalog)[0]?.href,
      "/seo/domain-age-checker",
    );
    assert.equal(
      searchSite("domain age lookup", catalog)[0]?.href,
      "/seo/domain-age-checker",
    );
    assert.equal(
      searchSite("whois age checker", catalog)[0]?.href,
      "/seo/domain-age-checker",
    );
    assert.equal(
      searchSite("vat number validator", catalog)[0]?.href,
      "/finance/vat-number-validator",
    );
    assert.equal(
      searchSite("vat number checker", catalog)[0]?.href,
      "/finance/vat-number-validator",
    );
    assert.equal(
      searchSite("eu vat validator", catalog)[0]?.href,
      "/finance/vat-number-validator",
    );
    assert.equal(
      searchSite("vat checker", catalog)[0]?.href,
      "/finance/vat-number-validator",
    );
    assert.equal(
      searchSite("break even sales calculator", catalog)[0]?.href,
      "/finance/break-even-sales-calculator",
    );
    assert.equal(
      searchSite("break even calculator", catalog)[0]?.href,
      "/finance/break-even-sales-calculator",
    );
    assert.equal(
      searchSite("break-even point calculator", catalog)[0]?.href,
      "/finance/break-even-sales-calculator",
    );
    assert.equal(
      searchSite("student loan refinance calculator", catalog)[0]?.href,
      "/finance/student-loan-refinance-calculator",
    );
    assert.equal(
      searchSite("student loan refinancing calculator", catalog)[0]?.href,
      "/finance/student-loan-refinance-calculator",
    );
    assert.equal(
      searchSite("refinance student loan calculator", catalog)[0]?.href,
      "/finance/student-loan-refinance-calculator",
    );
    assert.equal(
      searchSite("balance transfer calculator", catalog)[0]?.href,
      "/finance/balance-transfer-calculator",
    );
    assert.equal(
      searchSite("credit card balance transfer calculator", catalog)[0]?.href,
      "/finance/balance-transfer-calculator",
    );
    assert.equal(
      searchSite("balance transfer fee calculator", catalog)[0]?.href,
      "/finance/balance-transfer-calculator",
    );
    assert.equal(searchSite("household", catalog)[0]?.href, "/home");
    assert.equal(
      searchSite("soft wash mix calculator", catalog)[0]?.href,
      "/home/soft-wash-mix-calculator",
    );
    assert.equal(
      searchSite("softwash mix calculator", catalog)[0]?.href,
      "/home/soft-wash-mix-calculator",
    );
    assert.equal(
      searchSite("house wash mix calculator", catalog)[0]?.href,
      "/home/soft-wash-mix-calculator",
    );
    assert.equal(
      searchSite("house sq ft estimator", catalog)[0]?.href,
      "/home/house-sq-ft-estimator",
    );
    assert.equal(
      searchSite("house square footage estimator", catalog)[0]?.href,
      "/home/house-sq-ft-estimator",
    );
    assert.equal(
      searchSite("vinyl siding cleanability", catalog)[0]?.href,
      "/home/vinyl-siding-cleanability",
    );
    assert.equal(
      searchSite("siding cleanability checker", catalog)[0]?.href,
      "/home/vinyl-siding-cleanability",
    );
    assert.equal(
      searchSite("roof algae severity", catalog)[0]?.href,
      "/home/roof-algae-severity",
    );
    assert.equal(
      searchSite("roof algae quiz", catalog)[0]?.href,
      "/home/roof-algae-severity",
    );
  });
});
