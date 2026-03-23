# mock-private

## Positioning
このリポジトリは、これまでの試行錯誤的な開発成果を、将来継続利用できる「プラットフォーム型の開発基盤」へ移行するための整理用リポジトリです。現時点では実装資産よりも、今後の設計・運用・分業の土台づくりが中心です。

このブランチのテーマは **100-to-platform** です。これは「100本ノックの終了宣言」ではなく、反復開発で得た知見を再利用可能な資産へ変える起点を意味します。

## Current Status
- 実リポジトリの現状は最小構成で、設計・運用ドキュメントの整備が先行しています。
- 実装ディレクトリやアプリ構成は今後確定していく前提です。
- 不明な仕様は断定せず、文書上で `要確認` / `仮説` として扱っています。

## Recommended Reading Order
1. `docs/milestones/100-to-platform.md`
2. `docs/architecture/current-state.md`
3. `docs/architecture/target-state.md`
4. `docs/architecture/transition-plan.md`
5. `docs/operations/codex-workflow.md`
6. `docs/roadmap/next-phase-roadmap.md`
7. `docs/vision/product-vision.md`
8. `agents/orchestrator.md`

## Repository Guide
- `docs/architecture/`: 現状・目標・移行手順
- `docs/operations/`: Codex運用、変更ポリシー、ブランチ戦略
- `docs/vision/`: 将来の見せ方、プロダクト・プラットフォーム構想
- `docs/milestones/`: 節目ブランチの意味
- `docs/structure/`: 現在の構造把握資料
- `docs/decisions/`: 設計判断メモ
- `agents/`: 将来のHarness的運用を見据えたロール定義

## Agent Materials
このリポジトリでは、人間だけでなくCodexや将来の複数AI運用を前提にしています。`AGENTS.md` と `agents/*.md` は、変更時の判断基準と責務分担の参照点です。

## Near-Term Direction
- 実装前に構造と責務を定義する
- 単発成果物の追加ではなく、再利用可能な配置・命名・文書を優先する
- 将来外部提示できるよう、現状と構想の境界を明文化する

## Notes
- ユーザー指示上の対象ブランチは `milestone/100-to-platform` ですが、実環境で確認できるブランチ名と差異がある場合は要確認です。
- 実装が増えたら、このREADMEはセットアップ手順やアプリ一覧も含めて更新してください。
