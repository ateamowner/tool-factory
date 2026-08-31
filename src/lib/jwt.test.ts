import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { decodeBase64UrlUtf8, decodeJwt, formatUnixClaim } from "./jwt.ts";

const SAMPLE =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

describe("jwt decoder", () => {
  it("decodes header and payload without checking the signature", () => {
    const result = decodeJwt(SAMPLE);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.deepEqual(result.header, { alg: "HS256", typ: "JWT" });
    assert.deepEqual(result.payload, {
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    });
    assert.match(result.payloadJson, /"name": "John Doe"/);
    assert.equal(result.signaturePresent, true);
    const iat = result.claims.find((claim) => claim.name === "iat");
    assert.equal(iat?.display, "1516239022 (2018-01-18T01:30:22.000Z)");
  });

  it("accepts a Bearer prefix, whitespace, and an unsigned two-part token", () => {
    const unsigned =
      "eyJhbGciOiJub25lIn0.eyJzdWIiOiJ0ZXN0IiwibmJmIjoxNTE2MjM5MDIyLCJleHAiOjE1MTYyNDkwMjJ9";
    const result = decodeJwt(`Bearer \n${unsigned}\n`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.header.alg, "none");
    assert.equal(result.payload.sub, "test");
    assert.equal(result.signaturePresent, false);
    assert.ok(result.claims.some((claim) => claim.name === "exp" && claim.display.includes("2018-01-18")));
  });

  it("decodes UTF-8 claims from base64url", () => {
    const header = Buffer.from('{"alg":"none"}', "utf8")
      .toString("base64url")
      .replace(/=+$/, "");
    const payload = Buffer.from('{"name":"名前"}', "utf8")
      .toString("base64url")
      .replace(/=+$/, "");
    const result = decodeJwt(`${header}.${payload}`);
    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.payload.name, "名前");
    assert.equal(decodeBase64UrlUtf8(payload), '{"name":"名前"}');
  });

  it("rejects empty, malformed, and encrypted tokens", () => {
    assert.equal(decodeJwt("").ok, false);
    assert.equal(decodeJwt("only-one-part").ok, false);
    assert.equal(decodeJwt("a.b.c.d.e").ok, false);
    assert.equal(decodeJwt("@@@.@@@").ok, false);
    assert.equal(decodeJwt("e30.").ok, false);
  });

  it("formats unix timestamps used by iat, exp, and nbf", () => {
    assert.equal(formatUnixClaim(1516239022), "1516239022 (2018-01-18T01:30:22.000Z)");
    assert.equal(formatUnixClaim("nope"), null);
  });
});
