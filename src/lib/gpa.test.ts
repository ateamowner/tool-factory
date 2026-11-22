import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { computeGpa, pointsForGrade, coursePoints } from "./gpa.ts";

const base = { honorsBonus: 0.5, apBonus: 1, priorGpa: null, priorCredits: null };

describe("pointsForGrade", () => {
  it("maps letters to the 4.0 scale", () => {
    assert.equal(pointsForGrade("A+"), 4);
    assert.equal(pointsForGrade("a-"), 3.7);
    assert.equal(pointsForGrade("B"), 3);
    assert.equal(pointsForGrade("F"), 0);
    assert.equal(pointsForGrade("Z"), null);
  });
});

describe("coursePoints", () => {
  it("adds honors and AP bonus when weighted but not to an F", () => {
    assert.equal(coursePoints({ grade: "A", credits: 3, level: "ap" }, 0.5, 1, true), 5);
    assert.equal(coursePoints({ grade: "B", credits: 3, level: "honors" }, 0.5, 1, true), 3.5);
    assert.equal(coursePoints({ grade: "B", credits: 3, level: "ap" }, 0.5, 1, false), 3);
    assert.equal(coursePoints({ grade: "F", credits: 3, level: "ap" }, 0.5, 1, true), 0);
  });
});

describe("computeGpa", () => {
  it("computes a credit-weighted semester GPA", () => {
    const r = computeGpa({ ...base, courses: [
      { grade: "A", credits: 4, level: "regular" },
      { grade: "B", credits: 3, level: "regular" },
      { grade: "C", credits: 3, level: "regular" },
    ] });
    assert.ok(r.valid);
    assert.equal(r.semesterCredits, 10);
    assert.equal(r.semesterGpa, 3.1);
    assert.equal(r.cumulativeGpa, null);
  });

  it("reports weighted and unweighted GPA", () => {
    const r = computeGpa({ ...base, courses: [
      { grade: "A", credits: 3, level: "ap" },
      { grade: "B", credits: 3, level: "honors" },
    ] });
    assert.ok(r.valid);
    assert.equal(r.unweightedSemesterGpa, 3.5);
    assert.equal(r.weightedSemesterGpa, 4.25);
  });

  it("combines prior GPA and credits into a cumulative GPA", () => {
    const r = computeGpa({ ...base, priorGpa: 3.0, priorCredits: 30, courses: [
      { grade: "A", credits: 15, level: "regular" },
    ] });
    assert.ok(r.valid);
    assert.equal(r.cumulativeGpa, 3.33);
    assert.equal(r.cumulativeCredits, 45);
  });

  it("uses plus and minus grades", () => {
    const r = computeGpa({ ...base, courses: [{ grade: "A-", credits: 3, level: "regular" }, { grade: "B+", credits: 3, level: "regular" }] });
    assert.ok(r.valid);
    assert.equal(r.semesterGpa, 3.5);
  });

  it("rejects bad input", () => {
    assert.equal(computeGpa({ ...base, courses: [] }).valid, false);
    assert.equal(computeGpa({ ...base, courses: [{ grade: "A", credits: 0, level: "regular" }, { grade: "B", credits: 3, level: "regular" }] }).valid, false);
    assert.equal(computeGpa({ ...base, honorsBonus: -1, courses: [{ grade: "A", credits: 3, level: "regular" }] }).valid, false);
    assert.equal(computeGpa({ ...base, courses: [{ grade: "", credits: 3, level: "regular" }] }).valid, false);
  });
});
