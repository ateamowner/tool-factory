import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { faqPageJsonLd } from "./faq-schema.ts";
import {
  computeBottleneck,
  parseBottleneckCapacity,
  stepDisplayName,
} from "./bottleneck.ts";

function closeTo(actual: number, expected: number, epsilon = 1e-9) {
  assert.ok(
    Math.abs(actual - expected) <= epsilon,
    `expected ${actual} to be within ${epsilon} of ${expected}`,
  );
}

describe("parseBottleneckCapacity", () => {
  it("accepts commas and rejects blanks", () => {
    assert.equal(parseBottleneckCapacity("1,200"), 1200);
    assert.equal(parseBottleneckCapacity(" 80.5 "), 80.5);
    assert.equal(Number.isNaN(parseBottleneckCapacity("")), true);
    assert.equal(Number.isNaN(parseBottleneckCapacity("   ")), true);
  });
});

describe("stepDisplayName", () => {
  it("uses the typed name or a numbered fallback", () => {
    assert.equal(stepDisplayName("  Assembly ", 1), "Assembly");
    assert.equal(stepDisplayName("   ", 0), "Step 1");
  });
});

describe("computeBottleneck", () => {
  const line = [
    { name: "Mixing", capacity: 120 },
    { name: "Assembly", capacity: 80 },
    { name: "Inspection", capacity: 100 },
    { name: "Packing", capacity: 90 },
  ];

  it("sets throughput to the lowest capacity and utilization against that rate", () => {
    const result = computeBottleneck(line);
    assert.equal(result.status, "ok");
    assert.equal(result.valid, true);
    assert.equal(result.throughput, 80);
    assert.deepEqual(result.bottleneckNames, ["Assembly"]);

    const mixing = result.steps[0];
    assert.equal(mixing?.isBottleneck, false);
    closeTo(mixing?.utilizationPercent ?? 0, (80 / 120) * 100);
    closeTo(mixing?.idleCapacity ?? 0, 40);

    const assembly = result.steps[1];
    assert.equal(assembly?.isBottleneck, true);
    closeTo(assembly?.utilizationPercent ?? 0, 100);
    closeTo(assembly?.idleCapacity ?? 0, 0);

    closeTo(result.steps[2]?.utilizationPercent ?? 0, 80);
    closeTo(result.steps[3]?.utilizationPercent ?? 0, (80 / 90) * 100);
  });

  it("marks every tied lowest-capacity step as a bottleneck", () => {
    const result = computeBottleneck([
      { name: "Cut", capacity: 50 },
      { name: "Weld", capacity: 40 },
      { name: "Paint", capacity: 40 },
    ]);
    assert.equal(result.throughput, 40);
    assert.deepEqual(result.bottleneckNames, ["Weld", "Paint"]);
    assert.equal(result.steps.filter((step) => step.isBottleneck).length, 2);
    assert.ok(result.steps.every((step) => step.utilizationPercent <= 100 + 1e-9));
    closeTo(result.steps[0]?.utilizationPercent ?? 0, 80);
  });

  it("treats a single step as a fully utilized line", () => {
    const result = computeBottleneck([{ name: "", capacity: 25 }]);
    assert.equal(result.throughput, 25);
    assert.deepEqual(result.bottleneckNames, ["Step 1"]);
    closeTo(result.steps[0]?.utilizationPercent ?? 0, 100);
    closeTo(result.steps[0]?.idleCapacity ?? 0, 0);
  });

  it("rejects empty, zero, negative, and non-finite capacities", () => {
    assert.equal(computeBottleneck([]).status, "invalid");
    assert.equal(computeBottleneck([{ name: "A", capacity: 0 }]).status, "invalid");
    assert.equal(computeBottleneck([{ name: "A", capacity: -5 }]).status, "invalid");
    assert.equal(
      computeBottleneck([{ name: "A", capacity: Number.NaN }]).status,
      "invalid",
    );
    assert.equal(
      computeBottleneck([{ name: "A", capacity: Number.POSITIVE_INFINITY }]).status,
      "invalid",
    );
    assert.equal(
      computeBottleneck([
        { name: "A", capacity: 10 },
        { name: "B", capacity: 0 },
      ]).valid,
      false,
    );
  });
});

describe("FAQPage JSON-LD shape for bottleneck calculator", () => {
  it("emits a validator-friendly FAQPage", () => {
    const data = faqPageJsonLd([
      {
        question: "What is a bottleneck calculator?",
        answer:
          "A bottleneck calculator finds the process step with the lowest capacity and sets system throughput to that rate.",
      },
    ]);
    assert.equal(data["@context"], "https://schema.org");
    assert.equal(data["@type"], "FAQPage");
    assert.equal(data.mainEntity[0]?.["@type"], "Question");
    assert.equal(data.mainEntity[0]?.acceptedAnswer["@type"], "Answer");
    assert.equal(typeof data.mainEntity[0]?.acceptedAnswer.text, "string");
  });
});
