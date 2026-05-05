# Lumien-factory architecture

## 한 줄 정의

Lumien-factory는 `Lumien_private`의 통합 spine 매니페스트를 입력으로 받아
**라이프사이클 적합성·승격 가능성·역행 금지·gate 통과**를 검증하는 공개 안전(public-safe) 운영층이다.

## 경계

```
┌───────────────────────────────────────────────┐         ┌──────────────────────────────────────────────┐
│ Lumien_private  (THELUMIEN, private)          │         │ Lumien-factory  (THELUMIEN, this repo)        │
│                                                │         │                                                │
│  protocol/  memory/  decisions/  ideas/        │         │  src/                                          │
│  tasks/  projects/  products/  sources/        │         │   ├── types.ts                                 │
│  templates/  journey/  archive/                │         │   ├── manifest.ts                              │
│                                                │         │   ├── lifecycle.ts                             │
│  registry/                                     │         │   ├── validate.ts                              │
│   ├── unified/                                 │         │   ├── promote.ts                               │
│   │   ├── artifact-schema.yaml      ──────────────────▶ │   ├── graph.ts                                 │
│   │   ├── lifecycle-spine.yaml      ──────────────────▶ │   └── cli.ts                                   │
│   │   ├── folder-binding.yaml       ──────────────────▶ │  contracts/  ◀── public-safe sync mirror      │
│   │   └── artifact-manifest.yaml    ──────────────────▶ │                                                │
│   └── ...                                      │         │  .github/workflows/factory-validate.yml       │
│                                                │         │                                                │
│  protocol/canon/unified-system-architecture-v1 │         │                                                │
└───────────────────────────────────────────────┘         └──────────────────────────────────────────────┘
       │                                                                   │
       │   ◀───────────────  GitHub Issue / PR comment  ──────────────────┘
       │                       (검증 실패 시)
       ▼
   Hyun / Architect (private 리포에서 수정)
```

## 검증 대상

매니페스트의 각 entry에 대해:

| 검증 | 설명 | 위치 |
|------|------|------|
| schema 적합성       | 필수 필드 존재, type/authority 알려진 값 | `lifecycle.ts#checkSchema` |
| lifecycle_state    | type별 허용 state sequence 안 | `lifecycle.ts#checkLifecycleState` |
| 폴더 바인딩         | path가 folder-binding의 폴더 매칭 + type 수용 | `lifecycle.ts#checkFolderBinding` |
| transition         | parent → child가 spine#transitions 허용 | `lifecycle.ts#checkTransitions` |
| backflow 금지       | folder-binding#backflow_forbidden 위반 검사 | `lifecycle.ts#checkBackflow` |
| lineage 일관성     | parent/children 양방향 일치 | `lifecycle.ts#checkChildLinks` |
| id 유일성          | 매니페스트 내 중복 id 차단 | `lifecycle.ts#checkUniqueIds` |

## 비-역할

factory가 **하지 않는 것**:

- private 자산의 컨텐츠 읽기/저장/노출
- canon 자동 변경 (canon-change-gate-v1을 자동 통과시키지 않음)
- decision/task 자동 승격 (Hyun 승인 필요)
- 매니페스트 자동 갱신 (private 리포에서만 변경)

factory는 **검증과 시뮬레이션**만 한다 — 결과는 PR comment / Issue 형태로 외부에 노출.

## 매니페스트 흐름

```
1. private 리포에서 자산 작성/변경
   └─ templates/unified-artifact.md frontmatter

2. private 리포에서 registry/unified/artifact-manifest.yaml 갱신
   └─ id / type / path / state / parent 등록

3. private 리포 PR 머지

4. factory 리포에 sync PR (contracts/ 미러링)
   └─ factory-validate.yml 자동 실행
   └─ schema/spine/binding/transition/backflow/gate 검증

5. 검증 실패 시 PR 차단 + Issue 코멘트
```

## 향후 확장

- 매니페스트 자동 미러링 (private → factory) — GitHub App 또는 reusable workflow
- promotion gate 자동 검사 (gate 파일 존재 + 통과 마크 확인)
- 매니페스트 → SVG/PNG lineage 그래프 자동 게시
- production-line 진행도 추적 (`registry/production-lines.yaml` 결합)
- loop event 수집 (`registry/loop-contracts.yaml` 결합)

상세는 `Lumien_private:protocol/canon/unified-system-architecture-v1.md` §9.
