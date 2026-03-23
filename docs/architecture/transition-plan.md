# Transition Plan

## Overview
この文書は、現在の最小状態から、将来のプラットフォーム型リポジトリへ段階的に移るための計画です。理想論で終わらせず、「今すぐできる」「次にやる」「将来やる」を分けます。

## Phase 0: Immediate / Now
今すぐできる段階。今回のブランチで主に扱う範囲です。

- 現状把握文書を作る
- 目標状態と非目標を定義する
- Codex向け運用ルールを明文化する
- 複数ロール運用の骨格を `agents/` に置く
- READMEに読み順と位置づけを追加する
- 今後の変更で参照する最低限の判断軸を作る

### Exit Criteria
- 初見の人/AIが読むべき入口が分かる
- 現状と構想が文書上で区別されている
- 変更時にどの文書を見るか分かる

## Phase 1: Next / Structured Foundation
次にやる段階。実装を載せ始める前後で着手すべき項目です。

- 実在するアプリ/サービス候補を棚卸しする
- 主要ユースケースとドメイン概念を整理する
- `apps/` `services/` `packages/` 等の必要性を実態に即して確定する
- 最初の decision memo を蓄積する
- 命名規約、設定管理、テスト方針を決める
- 実験領域と本流領域の移動ルールを決める

### Exit Criteria
- 最低1つ以上の実装単位が責務に沿って配置されている
- 今後の追加先が迷いにくい
- 新機能追加時の判断手順が文書と一致している

## Phase 2: Later / Platformization
将来やる段階。複数成果物や共通基盤が見え始めたら進める項目です。

- 共通パッケージ化の対象を切り出す
- 共有設定、共通認証、共通データアクセス方針を整理する
- CI/CD、品質ゲート、レビュー導線を整備する
- ロール分担に基づく半自動運用を試す
- 外部提示用の説明資料とデモ導線を整える

### Exit Criteria
- 共通基盤の価値が実体として存在する
- 複数ロール運用が文書だけでなく運用でも機能する
- 対外説明時に「何を目指し、何ができているか」を明快に示せる

## Decision Rules During Transition
- 実体のない共通化はしない
- 一度に大規模移行しない
- 実装の増加に合わせて文書を更新する
- 不明点は `要確認` として残し、無理に確定しない
- 実験は残してもよいが、本流への昇格条件を明確にする

## Risks and Mitigations
### Risk: Documentation gets detached from reality
**Mitigation:** 変更時に文書更新を必須化し、READMEから主要文書への導線を維持する。

### Risk: Platform design becomes empty abstraction
**Mitigation:** 実装がないものは構想と明示し、実際のユースケースが出るまで固定化しない。

### Risk: AI agents optimize locally and break global structure
**Mitigation:** `AGENTS.md` と `agents/orchestrator.md` を入口にし、ロール間の依存と禁止事項を固定する。

## What We Need Before Full Platformization
- 実際のアプリ候補一覧
- 技術選定の方向性
- 変更頻度の高い領域の把握
- ドキュメント更新を運用に組み込む習慣
