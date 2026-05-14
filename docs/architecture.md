# Lumien-factory architecture

## What it is

A generic artifact lifecycle validator. The factory takes a four-file YAML bundle (schema + spine + binding + manifest) and verifies that the manifest conforms to the declared lifecycle rules.

## Inputs

```
contracts/
├── artifact-schema.yaml      shared schema (required fields, known types)
├── lifecycle-spine.yaml      phases, states, transitions, gates
├── folder-binding.yaml       folder ↔ phase mapping, backflow guards
└── artifact-manifest.yaml    the manifest to validate
```

The factory does not store, edit, or interpret artifact contents. It reads only the four YAML files above.

## Checks

For each manifest entry:

| Check | Description | Source |
|------|-------------|--------|
| schema conformance | required fields present, known type / authority | `lifecycle.ts#checkSchema` |
| lifecycle state    | state belongs to the type's allowed sequence | `lifecycle.ts#checkLifecycleState` |
| folder binding     | path matches a folder + folder accepts the type | `lifecycle.ts#checkFolderBinding` |
| transition         | parent.type → child.type is allowed by the spine | `lifecycle.ts#checkTransitions` |
| backflow           | folder-to-folder direction is not forbidden | `lifecycle.ts#checkBackflow` |
| lineage            | parent / children references resolve and agree | `lifecycle.ts#checkChildLinks` |
| id uniqueness      | no duplicate ids in the manifest | `lifecycle.ts#checkUniqueIds` |

## Output

- **stdout**: `ValidationReport` with severity / code / artifact / message
- **exit code**: non-zero on errors
- **optional**: Graphviz DOT graph of lineage (`pnpm factory graph --out spine.dot`)

## Non-roles

The factory does not:

- read or write artifact content
- mutate the manifest
- automatically enact state transitions (`promote` is simulation only)

Promotion and content edits happen outside this engine.

## Bundle flow

```
[author edits manifest in some upstream repo]
        │
        ▼
   contracts/*.yaml  (4 files)
        │
        ▼
   pnpm factory validate ./contracts
        │
        ▼
   ValidationReport  ──▶  CI gate / PR comment / issue
```

The four YAML files are the only contract between the factory and any consuming system.
