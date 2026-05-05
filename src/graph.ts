import { writeFileSync } from "node:fs";
import { loadSpineBundle } from "./manifest.js";

/**
 * Emit a Graphviz DOT graph of the manifest's lineage edges.
 * Nodes: artifact ids, colored by phase. Edges: parent → child.
 */
export function emitDot(dir: string, outPath?: string): string {
  const { manifest, schema } = loadSpineBundle(dir);

  const phaseByType = new Map<string, string>();
  for (const t of schema.types) {
    phaseByType.set(t.id, t.lifecycle_phase);
  }
  const phaseColor: Record<string, string> = {
    input: "#e0f7fa",
    processing: "#fff3e0",
    commitment: "#ffe0b2",
    execution: "#ffccbc",
    output_internal: "#dcedc8",
    output_external: "#c8e6c9",
    memory: "#e1bee7",
    control: "#bbdefb",
    cross_cutting: "#f5f5f5",
    terminal: "#cfd8dc",
  };

  const lines: string[] = [];
  lines.push("digraph LumienSpine {");
  lines.push('  rankdir="LR";');
  lines.push('  node [shape=box, style="filled,rounded", fontname="Helvetica"];');
  for (const a of manifest.artifacts) {
    const phase = phaseByType.get(a.type) ?? "control";
    const color = phaseColor[phase] ?? "#ffffff";
    const label = `${a.id}\\n[${a.type}]\\n${a.lifecycle_state}`;
    lines.push(`  "${a.id}" [label="${label}", fillcolor="${color}"];`);
  }
  for (const a of manifest.artifacts) {
    if (a.parent) {
      lines.push(`  "${a.parent}" -> "${a.id}";`);
    }
    for (const childId of a.children ?? []) {
      lines.push(`  "${a.id}" -> "${childId}";`);
    }
  }
  lines.push("}");
  const dot = lines.join("\n");
  if (outPath) writeFileSync(outPath, dot, "utf8");
  return dot;
}
