# Changelog

## [0.1.0]

Initial scaffold: a generic artifact lifecycle validator.

### Added
- spine YAML loader (`src/manifest.ts`)
- artifact / spine / binding TypeScript types (`src/types.ts`)
- lifecycle validator (`src/lifecycle.ts`, `src/validate.ts`)
  - schema, lifecycle_state, folder-binding, transition, backflow, lineage, unique-id checks
- promotion simulator (`src/promote.ts`)
- lineage Graphviz DOT extractor (`src/graph.ts`)
- CLI dispatch (`src/cli.ts`)
- synthetic example bundle in `contracts/`
- `factory-validate` GitHub Actions workflow
- node:test smoke tests

### Validation baseline

The synthetic example bundle validates with 0 errors and 0 warnings.
