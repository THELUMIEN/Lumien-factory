import type {
  Artifact,
  ArtifactType,
  BackflowRule,
  Finding,
  FolderBinding,
  Manifest,
  SchemaSpec,
  Spine,
  TransitionRule,
} from "./types.js";

const REQUIRED_FIELDS = [
  "id",
  "type",
  "path",
  "layer",
  "lifecycle_state",
  "authority",
] as const;

const KNOWN_AUTHORITIES = new Set([
  "canon",
  "grammar",
  "charter",
  "template",
  "registry",
  "runtime",
  "none",
]);

export interface SpineContext {
  schema: SchemaSpec;
  spine: Spine;
  binding: FolderBinding;
  manifest: Manifest;
}

/* ------------------------------------------------------------------------- */
/* Per-artifact checks                                                       */
/* ------------------------------------------------------------------------- */

export function checkSchema(artifact: Artifact, schema: SchemaSpec): Finding[] {
  const findings: Finding[] = [];
  for (const field of REQUIRED_FIELDS) {
    const value = (artifact as unknown as Record<string, unknown>)[field];
    if (value === undefined || value === null || value === "") {
      findings.push({
        severity: "error",
        code: "schema.required_field_missing",
        artifact: artifact.id ?? "<unknown>",
        message: `Required field '${field}' is missing.`,
      });
    }
  }
  if (artifact.authority && !KNOWN_AUTHORITIES.has(artifact.authority)) {
    findings.push({
      severity: "error",
      code: "schema.unknown_authority",
      artifact: artifact.id,
      message: `Unknown authority '${artifact.authority}'.`,
    });
  }
  const knownTypes = new Set(schema.types.map((t) => t.id));
  if (!knownTypes.has(artifact.type)) {
    findings.push({
      severity: "error",
      code: "schema.unknown_type",
      artifact: artifact.id,
      message: `Unknown artifact type '${artifact.type}'.`,
    });
  }
  if (!/^L[0-7]$/.test(artifact.layer)) {
    findings.push({
      severity: "warn",
      code: "schema.layer_format",
      artifact: artifact.id,
      message: `Layer '${artifact.layer}' is not in L0..L7 form.`,
    });
  }
  return findings;
}

export function checkLifecycleState(
  artifact: Artifact,
  spine: Spine,
): Finding[] {
  const def = spine.states[artifact.type];
  if (!def) {
    return [
      {
        severity: "warn",
        code: "lifecycle.state_table_missing",
        artifact: artifact.id,
        message: `No state sequence defined for type '${artifact.type}'.`,
      },
    ];
  }
  if (!def.sequence.includes(artifact.lifecycle_state)) {
    return [
      {
        severity: "error",
        code: "lifecycle.invalid_state",
        artifact: artifact.id,
        message: `lifecycle_state '${artifact.lifecycle_state}' not in allowed states for type '${artifact.type}': [${def.sequence.join(", ")}].`,
      },
    ];
  }
  return [];
}

// Cross-cutting types may live in any folder — they index/log other content.
const CROSS_CUTTING_TYPES = new Set(["registry_index", "journey_entry"]);

export function checkFolderBinding(
  artifact: Artifact,
  binding: FolderBinding,
): Finding[] {
  // Resolve folder by walking the path against binding keys.
  const path = artifact.path.replace(/^\/+/, "");
  const matches = Object.keys(binding.folders).filter((folder) => {
    const prefix = folder.endsWith("/") ? folder : `${folder}/`;
    return path === folder || path.startsWith(prefix);
  });
  if (matches.length === 0) {
    return [
      {
        severity: "warn",
        code: "binding.no_folder_match",
        artifact: artifact.id,
        message: `Path '${artifact.path}' does not match any folder defined in folder-binding.yaml.`,
      },
    ];
  }
  // pick longest (most specific) match
  const folder = matches.sort((a, b) => b.length - a.length)[0];
  const def = binding.folders[folder];
  if (CROSS_CUTTING_TYPES.has(artifact.type)) return [];
  if (!def.accepts.includes(artifact.type as ArtifactType)) {
    return [
      {
        severity: "error",
        code: "binding.type_not_accepted",
        artifact: artifact.id,
        message: `Folder '${folder}' does not accept type '${artifact.type}'. Accepted: [${def.accepts.join(", ")}].`,
      },
    ];
  }
  return [];
}

/* ------------------------------------------------------------------------- */
/* Cross-artifact checks                                                     */
/* ------------------------------------------------------------------------- */

export function checkTransitions(
  manifest: Manifest,
  spine: Spine,
): Finding[] {
  const byId = new Map(manifest.artifacts.map((a) => [a.id, a]));
  const allowed = new Map<ArtifactType, Set<ArtifactType>>();
  for (const t of spine.transitions as TransitionRule[]) {
    allowed.set(t.from, new Set(t.to));
  }
  const findings: Finding[] = [];
  for (const a of manifest.artifacts) {
    if (!a.parent) continue;
    const parent = byId.get(a.parent);
    if (!parent) {
      findings.push({
        severity: "error",
        code: "transition.parent_not_in_manifest",
        artifact: a.id,
        message: `parent '${a.parent}' is not present in the manifest.`,
      });
      continue;
    }
    const allowedSet = allowed.get(parent.type);
    if (!allowedSet) {
      findings.push({
        severity: "warn",
        code: "transition.no_rule_for_parent_type",
        artifact: a.id,
        message: `No transition rule defined for parent type '${parent.type}'.`,
      });
      continue;
    }
    if (!allowedSet.has(a.type)) {
      findings.push({
        severity: "error",
        code: "transition.disallowed",
        artifact: a.id,
        message: `Transition '${parent.type}' → '${a.type}' is not allowed (parent ${parent.id}). Allowed: [${[...allowedSet].join(", ")}].`,
      });
    }
  }
  return findings;
}

export function checkBackflow(
  manifest: Manifest,
  binding: FolderBinding,
): Finding[] {
  const findings: Finding[] = [];
  const byId = new Map(manifest.artifacts.map((a) => [a.id, a]));
  const rules: BackflowRule[] = binding.backflow_forbidden ?? [];

  function folderOf(path: string): string | undefined {
    return Object.keys(binding.folders)
      .filter((folder) => {
        const p = folder.endsWith("/") ? folder : `${folder}/`;
        return path === folder || path.startsWith(p);
      })
      .sort((a, b) => b.length - a.length)[0];
  }

  for (const a of manifest.artifacts) {
    if (!a.parent) continue;
    const parent = byId.get(a.parent);
    if (!parent) continue;
    const fromFolder = folderOf(parent.path);
    const toFolder = folderOf(a.path);
    if (!fromFolder || !toFolder) continue;
    for (const rule of rules) {
      if (rule.from === fromFolder && rule.to.includes(toFolder)) {
        findings.push({
          severity: "error",
          code: "backflow.forbidden",
          artifact: a.id,
          message: `Backflow forbidden: '${fromFolder}' → '${toFolder}' (parent ${parent.id} → child ${a.id}).${rule.note ? ` Note: ${rule.note}` : ""}`,
        });
      }
    }
  }
  return findings;
}

export function checkChildLinks(manifest: Manifest): Finding[] {
  const byId = new Map(manifest.artifacts.map((a) => [a.id, a]));
  const findings: Finding[] = [];
  for (const a of manifest.artifacts) {
    for (const childId of a.children ?? []) {
      const child = byId.get(childId);
      if (!child) {
        findings.push({
          severity: "warn",
          code: "lineage.child_not_in_manifest",
          artifact: a.id,
          message: `child '${childId}' not in manifest.`,
        });
        continue;
      }
      if (child.parent && child.parent !== a.id) {
        findings.push({
          severity: "warn",
          code: "lineage.parent_mismatch",
          artifact: a.id,
          message: `child '${childId}' lists a different parent: '${child.parent}'.`,
        });
      }
    }
  }
  return findings;
}

export function checkUniqueIds(manifest: Manifest): Finding[] {
  const seen = new Map<string, number>();
  for (const a of manifest.artifacts) {
    seen.set(a.id, (seen.get(a.id) ?? 0) + 1);
  }
  const findings: Finding[] = [];
  for (const [id, count] of seen) {
    if (count > 1) {
      findings.push({
        severity: "error",
        code: "manifest.duplicate_id",
        artifact: id,
        message: `id '${id}' appears ${count} times in the manifest.`,
      });
    }
  }
  return findings;
}
