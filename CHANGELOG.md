# Changelog

## [0.1.0] — 2026-05-05

Initial scaffold: operational spine for the LUMIEN unified system.

### Added
- spine YAML loader (`src/manifest.ts`)
- artifact / spine / binding TypeScript types (`src/types.ts`)
- lifecycle validator (`src/lifecycle.ts`, `src/validate.ts`)
  - schema, lifecycle_state, folder-binding, transition, backflow, lineage, unique-id checks
- promotion simulator (`src/promote.ts`)
- lineage Graphviz DOT extractor (`src/graph.ts`)
- CLI dispatch (`src/cli.ts`)
- public-safe sync mirror of `Lumien_private:registry/unified/*` under `contracts/`
- `factory-validate` GitHub Actions workflow
- node:test smoke tests (4 cases)
- architecture doc

### Validation baseline

Seed manifest: 41 artifacts, 0 errors, 0 warnings.

### Boundary

Factory does not read Lumien_private content — only the public-safe manifest.
See `docs/architecture.md` for the boundary diagram.
