import { test } from "node:test";
import assert from "node:assert/strict";
import { validateBundle } from "../src/validate.ts";
import { simulatePromote } from "../src/promote.ts";

test("contracts validate without errors", () => {
  const report = validateBundle("./contracts");
  if (report.errors > 0) {
    console.error(report.findings.filter((f) => f.severity === "error"));
  }
  assert.equal(report.errors, 0, "example manifest must validate clean");
  assert.ok(report.total > 0, "manifest must contain at least one artifact");
});

test("promote: forward task transition is allowed", () => {
  // SAMPLE-TASK is in lifecycle_state 'active' — promotion to 'done' is allowed
  // (state index moves forward in the task sequence).
  const result = simulatePromote("./contracts", "SAMPLE-TASK", "done");
  assert.equal(result.allowed, true);
});

test("promote: state regression is blocked", () => {
  // canonical → draft is a regression for protocol_canon.
  const result = simulatePromote(
    "./contracts",
    "SAMPLE-CANON-V1",
    "draft",
  );
  assert.equal(result.allowed, false);
});

test("promote: unknown id is rejected", () => {
  const result = simulatePromote("./contracts", "DOES-NOT-EXIST", "active");
  assert.equal(result.allowed, false);
  assert.equal(result.findings[0].code, "promote.artifact_not_found");
});
