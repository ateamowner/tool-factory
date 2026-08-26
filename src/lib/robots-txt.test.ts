import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  AI_CRAWLERS,
  appendAiCrawlerGroup,
  applyRobotsPreset,
  buildLlmsTxt,
  buildRobotsTxt,
  normalizeHttpUrl,
  normalizeRobotsPath,
} from "./robots-txt.ts";

describe("robots.txt helpers", () => {
  it("builds a default allow-all file with a sitemap", () => {
    const text = buildRobotsTxt({
      groups: applyRobotsPreset("allow-all"),
      sitemaps: ["example.com/sitemap.xml"],
    });

    assert.equal(
      text,
      ["User-agent: *", "Allow: /", "", "Sitemap: https://example.com/sitemap.xml"].join(
        "\n",
      ),
    );
  });

  it("writes a block-all robots.txt", () => {
    const text = buildRobotsTxt({
      groups: applyRobotsPreset("block-all"),
      sitemaps: [],
    });
    assert.equal(text, "User-agent: *\nDisallow: /");
  });

  it("blocks GPTBot, ClaudeBot, and Google-Extended in the AI preset", () => {
    const groups = applyRobotsPreset("block-ai");
    const text = buildRobotsTxt({ groups, sitemaps: [] });

    assert.match(text, /User-agent: \*\nAllow: \//);
    assert.match(text, /User-agent: GPTBot/);
    assert.match(text, /User-agent: ClaudeBot/);
    assert.match(text, /User-agent: Google-Extended/);
    assert.match(text, /Disallow: \//);
    for (const crawler of AI_CRAWLERS) {
      assert.match(text, new RegExp(`User-agent: ${crawler.id}`));
    }
  });

  it("keeps Googlebot allowed when the mixed preset is applied", () => {
    const text = buildRobotsTxt({
      groups: applyRobotsPreset("allow-google-block-ai"),
      sitemaps: [],
    });
    assert.match(text, /User-agent: Googlebot\nAllow: \//);
    assert.match(text, /User-agent: GPTBot/);
    assert.doesNotMatch(text, /User-agent: \*/);
  });

  it("adds an llms.txt comment and skips empty rules", () => {
    const text = buildRobotsTxt({
      groups: [
        {
          userAgents: ["*", ""],
          rules: [
            { kind: "allow", path: "/" },
            { kind: "disallow", path: "   " },
            { kind: "disallow", path: "admin" },
          ],
        },
        { userAgents: ["  "], rules: [{ kind: "disallow", path: "/" }] },
      ],
      sitemaps: ["", "https://example.com/sitemap.xml"],
      llmsTxtUrl: "example.com/llms.txt",
    });

    assert.equal(
      text,
      [
        "# llms.txt: https://example.com/llms.txt",
        "",
        "User-agent: *",
        "Allow: /",
        "Disallow: /admin",
        "",
        "Sitemap: https://example.com/sitemap.xml",
      ].join("\n"),
    );
  });

  it("appends an AI crawler group once", () => {
    const first = appendAiCrawlerGroup(applyRobotsPreset("allow-all"), "GPTBot");
    const second = appendAiCrawlerGroup(first, "GPTBot");
    assert.equal(second.length, 2);
    assert.deepEqual(second[1], {
      userAgents: ["GPTBot"],
      rules: [{ kind: "disallow", path: "/" }],
    });
  });

  it("normalizes paths and http URLs", () => {
    assert.equal(normalizeRobotsPath("private"), "/private");
    assert.equal(normalizeRobotsPath("/already"), "/already");
    assert.equal(normalizeHttpUrl("example.com/llms.txt"), "https://example.com/llms.txt");
    assert.equal(normalizeHttpUrl("https://ok.test/x"), "https://ok.test/x");
  });

  it("builds a short llms.txt companion file", () => {
    const text = buildLlmsTxt({
      title: "Example",
      summary: "Docs for AI crawlers.",
      siteUrl: "example.com",
    });
    assert.equal(
      text,
      ["# Example", "", "> Docs for AI crawlers.", "", "## Docs", "- [Example](https://example.com)"].join(
        "\n",
      ),
    );
  });
});
