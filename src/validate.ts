import { loadSpineBundle } from "./manifest.js";
import {
  checkBackflow,
  checkChildLinks,
  checkFolderBinding,
  checkLifecycleState,
  checkSchema,
  checkTransitions,
  checkUniqueIds,
} from "./lifecycle.js";
import type { Finding, ValidationReport } from "./types.js";

export function validateBundle(dir: string): ValidationReport {
  const bundle = loadSpineBundle(dir);
  const findings: Finding[] = [];

  for (const artifact of bundle.manifest.artifacts) {
    findings.push(...checkSchema(artifact, bundle.schema));
    findings.push(...checkLifecycleState(artifact, bundle.spine));
    findings.push(...checkFolderBinding(artifact, bundle.binding));
  }

  findings.push(...checkUniqueIds(bundle.manifest));
  findings.push(...checkTransitions(bundle.manifest, bundle.spine));
  findings.push(...checkBackflow(bundle.manifest, bundle.binding));
  findings.push(...checkChildLinks(bundle.manifest));

  const errors = findings.filter((f) => f.severity === "error").length;
  const warnings = findings.filter((f) => f.severity === "warn").length;

  return {
    total: bundle.manifest.artifacts.length,
    errors,
    warnings,
    findings,
  };
}

export function formatReport(report: ValidationReport): string {
  const lines: string[] = [];
  lines.push(
    `Lumien-factory validate — ${report.total} artifacts, ${report.errors} errors, ${report.warnings} warnings.`,
  );
  if (report.findings.length === 0) {
    lines.push("OK — no findings.");
    return lines.join("\n");
  }
  for (const f of report.findings) {
    const prefix = f.severity.toUpperCase().padEnd(5);
    const where = f.artifact ? ` [${f.artifact}]` : "";
    lines.push(`${prefix} ${f.code}${where}: ${f.message}`);
  }
  return lines.join("\n");
}
