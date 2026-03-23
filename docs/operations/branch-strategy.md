# Branch Strategy

## Current Principle
ブランチは「なぜこの変更束が必要か」が伝わる単位で切る。今回のような節目ブランチは、単一機能ではなく方向転換や基盤整備を表現する。

## Suggested Types
- `milestone/*`: 節目整理、方向転換、基盤再整理
- `feature/*`: 新機能
- `fix/*`: 小修正
- `docs/*`: 文書中心の更新
- `refactor/*`: 責務整理、構造改善

## Notes
- 実ブランチ名と計画上のブランチ名がずれている場合は、READMEまたは作業記録に残す。
- 大規模変更は文書更新を先行させる。
