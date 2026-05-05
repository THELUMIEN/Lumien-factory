# contracts/ — spine sync mirror

이 디렉터리는 `THELUMIEN/Lumien_private`의 `registry/unified/` 4개 파일의
**동기화 사본**입니다. 원본의 권위는 private 리포에 있습니다.

| 파일 | 원본 위치 |
|------|----------|
| `artifact-schema.yaml`   | `Lumien_private:registry/unified/artifact-schema.yaml`   |
| `lifecycle-spine.yaml`   | `Lumien_private:registry/unified/lifecycle-spine.yaml`   |
| `folder-binding.yaml`    | `Lumien_private:registry/unified/folder-binding.yaml`    |
| `artifact-manifest.yaml` | `Lumien_private:registry/unified/artifact-manifest.yaml` |

## 동기화 규칙

- 컨텐츠 자산(소스, 결정, 메모리 등)은 **절대 복사하지 않는다**.
- 매니페스트에는 id / type / path / state / 관계만 포함한다 (공개 안전).
- 사본 동기화는 PR 단위 (private 리포의 매니페스트 변경 → factory PR로 미러링).
- 사본 변경은 factory에서 단독으로 권위를 갖지 않는다 — 항상 private의 원본을 따라간다.

## 검증

```
pnpm factory validate ./contracts
```
