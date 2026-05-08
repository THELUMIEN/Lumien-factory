import { readFileSync } from "node:fs";
import { join } from "node:path";
import YAML from "yaml";
import type {
  FolderBinding,
  Manifest,
  SchemaSpec,
  Spine,
} from "./types.js";

export interface SpineBundle {
  schema: SchemaSpec;
  spine: Spine;
  binding: FolderBinding;
  manifest: Manifest;
}

function loadYaml<T>(path: string): T {
  const raw = readFileSync(path, "utf8");
  return YAML.parse(raw) as T;
}

/**
 * Loads the four spine files from a directory.
 * Expected layout:
 *   <dir>/artifact-schema.yaml
 *   <dir>/lifecycle-spine.yaml
 *   <dir>/folder-binding.yaml
 *   <dir>/artifact-manifest.yaml
 */
export function loadSpineBundle(dir: string): SpineBundle {
  return {
    schema: loadYaml<SchemaSpec>(join(dir, "artifact-schema.yaml")),
    spine: loadYaml<Spine>(join(dir, "lifecycle-spine.yaml")),
    binding: loadYaml<FolderBinding>(join(dir, "folder-binding.yaml")),
    manifest: loadYaml<Manifest>(join(dir, "artifact-manifest.yaml")),
  };
}
