# Lumien-factory

A generic artifact lifecycle validator. Given a four-file YAML bundle (schema + spine + binding + manifest), the factory verifies that artifacts conform to the declared rules.

## What it validates

1. **schema conformance** — required fields present, known types and authorities
2. **lifecycle state** — state belongs to the type's allowed sequence
3. **folder binding** — path matches a folder that accepts the artifact type
4. **transitions** — `parent.type` → `child.type` is allowed by the spine
5. **backflow** — folder-to-folder direction is not forbidden
6. **lineage** — parent / children references resolve and agree
7. **id uniqueness** — no duplicate ids in the manifest

## Spine inputs (in `contracts/`)

| File | Role |
|------|------|
| `artifact-schema.yaml`   | shared schema for all artifact types |
| `lifecycle-spine.yaml`   | phases, states, transitions, gates |
| `folder-binding.yaml`    | folder ↔ phase mapping, backflow guards |
| `artifact-manifest.yaml` | the manifest under validation |

The four files in `contracts/` are a **synthetic example**. To validate your own manifest, replace them or point the CLI at a different directory.

## Run

```bash
pnpm install
pnpm factory validate ./contracts                # validate the bundle
pnpm factory promote --id <ID> --to <state>      # simulate a state transition
pnpm factory graph --out spine.dot               # extract the lineage as DOT
```

## Layout

```
src/
├── types.ts            — schema / spine TypeScript types
├── manifest.ts         — YAML loader
├── lifecycle.ts        — state / transition / gate / backflow checks
├── validate.ts         — manifest validator (CLI entry)
├── promote.ts          — state transition simulator
├── graph.ts            — Graphviz DOT lineage extractor
└── cli.ts              — CLI dispatch
contracts/              — synthetic example bundle
.github/workflows/
└── factory-validate.yml — PR / push validation
docs/
└── architecture.md      — engine overview
tests/
└── lifecycle.test.ts    — smoke tests
```

## Non-roles

The factory does **not**:

- read or write artifact content (it sees only the four YAML files)
- mutate the manifest
- automatically enact state transitions (`promote` is simulation only)

It is a pure verifier. Promotion and content edits happen externally.
