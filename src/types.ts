// LUMIEN unified system types.
// Mirrors registry/unified/{artifact-schema,lifecycle-spine,folder-binding}.yaml
// in the Lumien_private repo.

export type AuthorityLevel =
  | "canon"
  | "grammar"
  | "charter"
  | "template"
  | "registry"
  | "runtime"
  | "none";

export type ArtifactType =
  | "source"
  | "idea"
  | "decision"
  | "task"
  | "project"
  | "product"
  | "memory_root"
  | "memory_identity"
  | "memory_vision"
  | "memory_operation"
  | "protocol_canon"
  | "protocol_charter"
  | "protocol_kernel"
  | "protocol_grammar"
  | "protocol_schema"
  | "protocol_codex"
  | "protocol_compiler"
  | "protocol_bridge"
  | "protocol_domain"
  | "template"
  | "registry_index"
  | "journey_entry"
  | "archive_entry";

export type LifecyclePhase =
  | "input"
  | "processing"
  | "commitment"
  | "execution"
  | "output_internal"
  | "output_external"
  | "memory"
  | "control"
  | "cross_cutting"
  | "terminal";

export type Verification = "passed" | "warn" | "failed" | "pending";

export interface Provenance {
  created_by?: string;
  created_at?: string;
  updated_at?: string;
  source_event?: string;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  path: string;
  layer: string; // "L0" .. "L7"
  lifecycle_state: string;
  authority: AuthorityLevel;
  category?: string;
  parent?: string | null;
  children?: string[];
  produces?: string[];
  consumes?: string[];
  gate?: string | null;
  verification?: Verification;
  provenance?: Provenance;
  tags?: string[];
}

export interface Manifest {
  version: number;
  profile: string;
  status: string;
  schema: string;
  spine: string;
  binding: string;
  spine_doc: string;
  generated_at?: string;
  generation?: string;
  artifacts: Artifact[];
}

// ─────────── lifecycle-spine.yaml ───────────

export interface PhaseDef {
  id: LifecyclePhase;
  label: string;
  folders: string[];
  purpose: string;
  next: LifecyclePhase[];
}

export interface StatesByType {
  [artifactType: string]: { sequence: string[] };
}

export interface TransitionRule {
  from: ArtifactType;
  to: ArtifactType[];
  note?: string;
}

export interface LoopBindingDef {
  spec: string;
  reads: string[];
  writes: string[];
}

export interface Spine {
  version: number;
  profile: string;
  status: string;
  schema: string;
  spine_doc: string;
  phases: PhaseDef[];
  states: StatesByType;
  transitions: TransitionRule[];
  gates: Record<string, string>;
  loop_binding: Record<string, LoopBindingDef>;
}

// ─────────── folder-binding.yaml ───────────

export interface FolderDef {
  phase: LifecyclePhase;
  accepts: ArtifactType[];
  upstream: string[];
  downstream: string[];
  gate?: string | { default?: string; canon_change?: string };
  rule?: string;
  // sub_axis / files / index / etc. are descriptive only — not validated
  [key: string]: unknown;
}

export interface BackflowRule {
  from: string;
  to: string[];
  note?: string;
}

export interface FolderBinding {
  version: number;
  profile: string;
  status: string;
  schema: string;
  spine: string;
  folders: Record<string, FolderDef>;
  backflow_forbidden: BackflowRule[];
}

// ─────────── artifact-schema.yaml ───────────

export interface ArtifactTypeDef {
  id: ArtifactType;
  folder: string;
  lifecycle_phase: LifecyclePhase;
  description?: string;
}

export interface SchemaSpec {
  version: number;
  profile: string;
  status: string;
  spine_doc: string;
  required_fields: string[];
  optional_fields: unknown[];
  types: ArtifactTypeDef[];
}

// ─────────── validation result ───────────

export type Severity = "error" | "warn" | "info";

export interface Finding {
  severity: Severity;
  code: string;
  artifact?: string;
  message: string;
}

export interface ValidationReport {
  total: number;
  errors: number;
  warnings: number;
  findings: Finding[];
}
