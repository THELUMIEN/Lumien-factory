# contracts/ — example bundle

A **synthetic** four-file bundle used as an example input to the validator.
Nothing here corresponds to any real artifact; the entries exist only so the
CLI and tests have something to validate against.

| File | Role |
|------|------|
| `artifact-schema.yaml`   | shared schema |
| `lifecycle-spine.yaml`   | phases, states, transitions, gates |
| `folder-binding.yaml`    | folder ↔ phase mapping, backflow guards |
| `artifact-manifest.yaml` | example manifest |

## Use your own bundle

Replace the four files in place, or point the CLI at a different directory:

```
pnpm factory validate ./your-spine-dir
```

All four files must be present in the target directory.
