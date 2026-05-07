import { loadSpineBundle } from "./manifest.js";
import type { Finding } from "./types.js";

/**
 * Simulate a state transition for an artifact in the manifest.
 * Returns findings — does NOT mutate the manifest. The factory does not
 * write back into any source repository; promotion is enacted externally.
 */
export function simulatePromote(
  dir: string,
  id: string,
  toState: string,
): { allowed: boolean; findings: Finding[] } {
  const { manifest, spine } = loadSpineBundle(dir);
  const a = manifest.artifacts.find((x) => x.id === id);
  if (!a) {
    return {
      allowed: false,
      findings: [
        {
          severity: "error",
          code: "promote.artifact_not_found",
          artifact: id,
          message: `Artifact '${id}' not in manifest.`,
        },
      ],
    };
  }
  const sequence = spine.states[a.type]?.sequence;
  if (!sequence) {
    return {
      allowed: false,
      findings: [
        {
          severity: "error",
          code: "promote.no_states_for_type",
          artifact: id,
          message: `No state sequence for type '${a.type}'.`,
        },
      ],
    };
  }
  if (!sequence.includes(toState)) {
    return {
      allowed: false,
      findings: [
        {
          severity: "error",
          code: "promote.invalid_target_state",
          artifact: id,
          message: `Target state '${toState}' not in [${sequence.join(", ")}].`,
        },
      ],
    };
  }
  const fromIdx = sequence.indexOf(a.lifecycle_state);
  const toIdx = sequence.indexOf(toState);
  if (toIdx < fromIdx) {
    return {
      allowed: false,
      findings: [
        {
          severity: "error",
          code: "promote.regression",
          artifact: id,
          message: `Cannot regress '${a.lifecycle_state}' (idx ${fromIdx}) → '${toState}' (idx ${toIdx}).`,
        },
      ],
    };
  }
  return {
    allowed: true,
    findings: [
      {
        severity: "info",
        code: "promote.allowed",
        artifact: id,
        message: `${a.type}: '${a.lifecycle_state}' → '${toState}' is allowed by spine. Gate (if any): '${a.gate ?? "none"}'.`,
      },
    ],
  };
}
