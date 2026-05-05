# Lumien-factory

LUMIEN 통합 시스템의 **운영 spine** (public-safe).

이 리포는 `THELUMIEN/Lumien_private`에 정의된 통합 spine을 입력으로 받아
라이프사이클 검증·승격을 자동화한다. **컨텐츠는 보관하지 않는다** —
오직 매니페스트 계약과 검증 로직만 보유.

## 경계

```
Lumien_private  ──[artifact-manifest.yaml (공개 안전)]──▶  Lumien-factory
   (컨텐츠 + 매니페스트)                                       (검증 / 승격 자동화)

   ◀─────────────[검증 결과 / Issue / PR comment]─────────────
```

- factory는 `Lumien_private`의 자산 컨텐츠를 **읽지 않는다**.
- factory가 입력으로 받는 것: `registry/unified/artifact-manifest.yaml` (공개 안전).
- factory가 검증하는 것:
  1. schema 적합성 — 필수 필드 존재
  2. lifecycle_state 적합성 — 해당 type의 허용 state
  3. transition 적합성 — parent → child가 spine에 정의된 허용 transition
  4. backflow 금지 — 폴더 간 역행 의존
  5. gate 통과 여부 — 요구되는 protocol gate

## Spine 입력

| 파일 (Lumien_private) | 의미 |
|------|------|
| `registry/unified/artifact-schema.yaml`   | 공통 스키마 |
| `registry/unified/lifecycle-spine.yaml`   | phase / state / transition / gate |
| `registry/unified/folder-binding.yaml`    | 폴더 매핑 / 역행 금지 |
| `registry/unified/artifact-manifest.yaml` | 자산 등록 |

이 4개 파일의 사본은 `contracts/`에 동기화 보관(원본 권위는 private 리포).

## 실행

```bash
pnpm install
pnpm factory validate ./contracts        # spine 4개 파일 + manifest 검증
pnpm factory promote --dry-run <id>      # transition 시뮬레이션
pnpm factory graph --out spine.dot       # lineage 그래프 추출
```

## 디렉터리

```
src/
├── types.ts            — schema/spine TypeScript 타입
├── manifest.ts         — manifest YAML 로더
├── lifecycle.ts        — state / transition / gate 검증 로직
├── validate.ts         — 매니페스트 적합성 검증 (CLI 진입)
├── promote.ts          — transition 시뮬레이션
├── graph.ts            — lineage 그래프 추출
└── cli.ts              — CLI dispatch
contracts/              — Lumien_private spine 4개 파일 동기화 사본
.github/workflows/
└── factory-validate.yml — PR / push 시 검증
docs/
└── architecture.md      — 경계 / 동작 / 입출력
tests/
└── lifecycle.test.ts    — 라이프사이클 검증 스모크
```

## 관련 (Lumien_private)

- `protocol/canon/unified-system-architecture-v1.md` — spine canon
- `registry/unified/README.md` — spine 디렉터리 가이드
