#!/usr/bin/env node
import { writeFileSync } from "node:fs";
import { formatReport, validateBundle } from "./validate.js";
import { simulatePromote } from "./promote.js";
import { emitDot } from "./graph.js";

function usage(): void {
  console.log(
    [
      "Lumien-factory CLI",
      "",
      "Usage:",
      "  factory validate <spine-dir>                    Validate manifest against spine",
      "  factory promote --dry-run <id> --to <state>     Simulate state transition",
      "  factory graph [--out <file.dot>]                Emit Graphviz DOT of lineage",
      "",
      "Default <spine-dir> = ./contracts",
      "",
      "Inputs (in spine-dir):",
      "  artifact-schema.yaml",
      "  lifecycle-spine.yaml",
      "  folder-binding.yaml",
      "  artifact-manifest.yaml",
    ].join("\n"),
  );
}

function parseFlag(args: string[], flag: string): string | undefined {
  const i = args.indexOf(flag);
  if (i === -1) return undefined;
  return args[i + 1];
}

async function main(): Promise<number> {
  const [, , cmd, ...rest] = process.argv;
  if (!cmd || cmd === "--help" || cmd === "-h") {
    usage();
    return 0;
  }

  if (cmd === "validate") {
    const dir = rest[0] && !rest[0].startsWith("--") ? rest[0] : "./contracts";
    const report = validateBundle(dir);
    console.log(formatReport(report));
    return report.errors === 0 ? 0 : 1;
  }

  if (cmd === "promote") {
    const dir = parseFlag(rest, "--dir") ?? "./contracts";
    const id = parseFlag(rest, "--id") ?? rest.find((a) => !a.startsWith("--"));
    const to = parseFlag(rest, "--to");
    if (!id || !to) {
      console.error("Usage: factory promote --id <ARTIFACT-ID> --to <state> [--dir <spine-dir>]");
      return 2;
    }
    const result = simulatePromote(dir, id, to);
    for (const f of result.findings) {
      const prefix = f.severity.toUpperCase().padEnd(5);
      console.log(`${prefix} ${f.code} [${f.artifact}]: ${f.message}`);
    }
    return result.allowed ? 0 : 1;
  }

  if (cmd === "graph") {
    const dir = parseFlag(rest, "--dir") ?? "./contracts";
    const out = parseFlag(rest, "--out");
    const dot = emitDot(dir, out);
    if (!out) {
      console.log(dot);
    } else {
      writeFileSync(out, dot, "utf8");
      console.log(`wrote ${out}`);
    }
    return 0;
  }

  usage();
  return 2;
}

main().then(
  (code) => process.exit(code),
  (err) => {
    console.error(err instanceof Error ? err.stack ?? err.message : err);
    process.exit(3);
  },
);
