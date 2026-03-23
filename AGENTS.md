# Repository Purpose

このリポジトリは、短期的な試作や「100本ノック」的な反復成果を、将来継続運用できるプロダクト/プラットフォーム基盤へ再編するための土台です。現時点では実装資産はまだ薄く、主な価値はこれから蓄積される構造・判断・文書化の一貫性にあります。

## Read First

変更を始める前に、最低限以下を読むこと。

1. `README.md`
2. `docs/milestones/100-to-platform.md`
3. `docs/architecture/current-state.md`
4. `docs/architecture/target-state.md`
5. `docs/architecture/transition-plan.md`
6. `docs/operations/codex-workflow.md`
7. `docs/operations/change-policy.md`
8. `agents/orchestrator.md`

## Working Principles

- 今回の主眼は、場当たり的な機能追加ではなく構造化・責務整理・文書化です。
- 不明な点は推測で埋めず、**要確認** または **仮説** と明記します。
- 既存実装が少ない場合でも、将来の拡張を見据えた判断理由を文章で残します。
- 大きな変更ほど、先に `docs/` の設計・方針文書を更新してから実装に着手します。
- 既存コードを壊すくらいなら、今回は文書化して保留することを優先します。

## Before Changing Anything

- 現在ブランチ名と目的が一致しているか確認する。現時点ではユーザー指示上の対象ブランチは `milestone/100-to-platform` だが、実環境のブランチ名は別の可能性があるため要確認。
- `git status` で他者の未コミット変更がないか確認する。
- 対象領域に既存の設計文書・決定メモがあるか確認する。
- 変更対象が単発修正なのか、設計変更なのか、将来運用に影響するのかを分類する。

## Areas That Must Not Be Changed Carelessly

- 将来の構造判断の根拠になる `docs/architecture/` 配下。
- ロール運用のルールを定義する `agents/` 配下。
- ワークフロー規約を定める `docs/operations/` 配下。
- 既存の実装が増えた後は、エントリポイント・インフラ設定・共有スキーマを不用意に変更しない。

## Documentation Update Rules

次に該当する変更をしたら、関連文書を同時更新すること。

- 役割や責務の変更: `docs/architecture/` と `agents/`
- 開発フローの変更: `docs/operations/`
- リポジトリの位置づけ変更: `README.md` と `docs/vision/`
- 重要な判断追加: `docs/decisions/`

## After Making Changes

- 変更したファイルに対応する文書更新が必要か見直す。
- 追加したディレクトリ/責務が `target-state` と矛盾していないか確認する。
- 今回の変更が「100本ノック的な増築」に戻っていないか自己レビューする。
- 必要なら `docs/structure/repository-map.md` に現在地を反映する。

## Expected Deliverables Per Change

- 小修正: 差分 + 必要最小限の説明文書更新
- 設計変更: 差分 + 関連architecture文書 + decision memo
- 新機能: 要件メモ + 設計更新 + 実装 + 運用影響の記述

## Default Rule for AI Agents

迷ったら「実装を増やす」よりも「構造・責務・判断理由を明確にする」を優先してください。
