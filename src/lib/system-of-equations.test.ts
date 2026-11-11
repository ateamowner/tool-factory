import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { fracToString, parseFrac, solveSystem } from "./system-of-equations.ts";

const sol = (r: ReturnType<typeof solveSystem>) => (r.valid ? r.solution.map(fracToString) : []);

describe("parseFrac", () => {
  it("parses integers, decimals, fractions", () => {
    assert.equal(fracToString(parseFrac("-2.5")!), "-5/2");
    assert.equal(fracToString(parseFrac("1/3")!), "1/3");
    assert.equal(fracToString(parseFrac(" 4 ")!), "4");
    assert.equal(parseFrac("abc"), null);
    assert.equal(parseFrac(""), null);
    assert.equal(parseFrac("1/0"), null);
  });
});

describe("solveSystem 2x2", () => {
  it("solves a unique system", () => {
    const r = solveSystem(2, [["2", "1", "5"], ["1", "-1", "1"]]);
    assert.ok(r.valid);
    assert.equal(r.status, "unique");
    assert.deepEqual(sol(r), ["2", "1"]);
    assert.ok(r.substitutionSteps.at(-1)!.startsWith("Answer: x = 2, y = 1"));
  });
  it("gives fractions", () => {
    const r = solveSystem(2, [["3", "2", "7"], ["1", "-4", "0"]]);
    assert.deepEqual(sol(r), ["2", "1/2"]);
    const r2 = solveSystem(2, [["1", "1", "1"], ["1", "-2", "0"]]);
    assert.deepEqual(sol(r2), ["2/3", "1/3"]);
  });
  it("detects no solution and infinite solutions", () => {
    const none = solveSystem(2, [["1", "1", "2"], ["2", "2", "5"]]);
    assert.ok(none.valid);
    assert.equal(none.status, "none");
    assert.ok(none.substitutionSteps.join(" ").includes("no solution"));
    const inf = solveSystem(2, [["1", "1", "2"], ["2", "2", "4"]]);
    assert.ok(inf.valid);
    assert.equal(inf.status, "infinite");
    assert.ok(inf.substitutionSteps.join(" ").includes("infinitely many"));
  });
  it("handles a zero coefficient and decimals", () => {
    const r = solveSystem(2, [["0", "2", "6"], ["1.5", "1", "7.5"]]);
    assert.deepEqual(sol(r), ["3", "3"]);
  });
  it("rejects bad input", () => {
    const r = solveSystem(2, [["1", "x", "2"], ["1", "1", "2"]]);
    assert.equal(r.valid, false);
  });
});

describe("solveSystem 3x3", () => {
  it("solves a unique system", () => {
    const r = solveSystem(3, [["1", "1", "1", "6"], ["0", "2", "5", "-4"], ["2", "5", "-1", "27"]]);
    assert.ok(r.valid);
    assert.equal(r.status, "unique");
    assert.deepEqual(sol(r), ["5", "3", "-2"]);
    assert.ok(r.substitutionSteps.at(-1)!.includes("x = 5, y = 3, z = −2"));
    assert.equal(fracToString(r.determinant), "-21");
  });
  it("detects dependent and inconsistent systems", () => {
    const inf = solveSystem(3, [["1", "1", "1", "3"], ["2", "2", "2", "6"], ["1", "-1", "0", "0"]]);
    assert.ok(inf.valid);
    assert.equal(inf.status, "infinite");
    const none = solveSystem(3, [["1", "1", "1", "3"], ["1", "1", "1", "4"], ["1", "-1", "0", "0"]]);
    assert.ok(none.valid);
    assert.equal(none.status, "none");
  });
  it("matches substitution answer to elimination answer", () => {
    const r = solveSystem(3, [["2", "-1", "3", "9"], ["1", "4", "-2", "-3"], ["3", "2", "1", "8"]]);
    assert.ok(r.valid);
    assert.equal(r.status, "unique");
    const last = r.substitutionSteps.at(-1)!;
    assert.equal(last, `Answer: ${r.names.map((n, i) => `${n} = ${fracToString(r.solution[i]).replace("-", "−")}`).join(", ")}`);
  });
});
