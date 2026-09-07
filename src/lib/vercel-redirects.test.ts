import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

type VercelRedirect = {
  source: string;
  destination: string;
  statusCode?: number;
  has?: { type: string; value: string }[];
};

const vercelJson = JSON.parse(
  readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../../vercel.json"), "utf8"),
) as { redirects: VercelRedirect[] };

describe("vercel.json fallback host redirects", () => {
  it("301s tool-factory-alpha.vercel.app paths onto https://ateamkit.com", () => {
    const production = vercelJson.redirects.find((rule) =>
      rule.has?.some(
        (condition) =>
          condition.type === "host" && condition.value === "tool-factory-alpha.vercel.app",
      ),
    );

    assert.ok(production);
    assert.equal(production.source, "/:path*");
    assert.equal(production.destination, "https://ateamkit.com/:path*");
    assert.equal(production.statusCode, 301);
  });

  it("301s any remaining *.vercel.app hostname onto https://ateamkit.com", () => {
    const wildcard = vercelJson.redirects.find((rule) =>
      rule.has?.some(
        (condition) =>
          condition.type === "host" && condition.value.includes("vercel\\.app"),
      ),
    );

    assert.ok(wildcard);
    assert.equal(wildcard.source, "/:path*");
    assert.equal(wildcard.destination, "https://ateamkit.com/:path*");
    assert.equal(wildcard.statusCode, 301);
    assert.equal(
      vercelJson.redirects.every((rule) => rule.destination.startsWith("https://ateamkit.com")),
      true,
    );
    assert.equal(JSON.stringify(vercelJson).includes("http://"), false);
  });
});
