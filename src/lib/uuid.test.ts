import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateUuidV4, generateUuidV7, generateUuids, uuidVersion } from "./uuid.ts";

describe("uuid generator", () => {
  it("creates a version 4 UUID with the RFC variant", () => {
    const id = generateUuidV4();
    assert.equal(uuidVersion(id), 4);
    assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("creates a version 7 UUID that encodes the timestamp", () => {
    const now = Date.UTC(2026, 7, 25, 12, 0, 0);
    const id = generateUuidV7(now);
    assert.equal(uuidVersion(id), 7);
    const hex = id.replaceAll("-", "").slice(0, 12);
    assert.equal(Number.parseInt(hex, 16), now);
  });

  it("bulk-generates the requested count", () => {
    const ids = generateUuids(4, 5);
    assert.equal(ids.length, 5);
    assert.equal(new Set(ids).size, 5);
  });
});
