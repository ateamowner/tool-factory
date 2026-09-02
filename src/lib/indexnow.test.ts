import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  INDEXNOW_KEY,
  INDEXNOW_KEY_FILENAME,
  INDEXNOW_KEY_URL,
} from "./indexnow.ts";

describe("IndexNow key file", () => {
  it("is a real hex key hosted at the site-root filename", () => {
    assert.match(INDEXNOW_KEY, /^[0-9a-f]{32}$/);
    assert.equal(INDEXNOW_KEY_FILENAME, `${INDEXNOW_KEY}.txt`);
    assert.equal(
      INDEXNOW_KEY_URL,
      `https://ateamkit.com/${INDEXNOW_KEY}.txt`,
    );
  });

  it("matches public/<key>.txt so Pages serves text/plain at the root", () => {
    const hosted = readFileSync(`public/${INDEXNOW_KEY_FILENAME}`, "utf8").trim();
    assert.equal(hosted, INDEXNOW_KEY);
  });
});
