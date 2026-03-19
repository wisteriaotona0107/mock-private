# AGENTS.md

## Purpose
このリポジトリは、業務タブレットUIを対象として、要件整理、画面設計、状態設計、Figma相当構造化、実装、レビュー、テスト、納品整理までを分担実行するためのマルチエージェント運用リポジトリである。

本プロジェクトの主目的は以下。
- 業務利用に耐える、誤操作しにくいタブレットUIを設計する
- 抽象的な要望やバイブを、実装可能なUI仕様に変換する
- 将来的な Harness AI 的運用を見据え、責務分離された md 群で作業する
- 設計、実装、レビュー、テストの往復を前提に品質を高める

## First read
作業開始時は必ず以下をこの順で読むこと。

1. `AGENTS.md`
2. `agents/orchestrator.md`
3. `agents/context-product.md`
4. `agents/context-design-system.md`
5. `agents/context-tablet-ops.md`

その後、現在のタスク内容に応じて `agents/` 配下の専門エージェントmdを読むこと。

## Repository structure
- `agents/`: 役割別エージェント定義と共通コンテキスト
- `docs/`: 要件、業務フロー、UI仕様、token、データ、テスト戦略
- `src/`: 実装用ディレクトリ

## Operating model
本プロジェクトでは単一エージェントで全判断を行わない。
責務に応じて以下の役割へ分割する。

- Orchestrator: タスク分解、依存整理、ルーティング
- UI Designer: 画面構造、情報設計、UI仕様
- UX Writer: 業務導線文言、ラベル、補助文
- Figma Translator: フレーム、トークン、バリアント、制約整理
- State/Data: 状態、イベント、データ構造、表示条件
- Frontend Impl: HTML/CSS/JS 実装
- Reviewer: 要件・UX・実装レビュー
- Test: 受け入れ条件と確認観点整理
- Release: 納品物整理、残課題整理

## Global rules
- 業務利用UIは見た目よりも、誤操作防止と理解しやすさを優先する
- 抽象表現をそのままUIにしない。必ず構造化する
- いきなり完成コードを書かず、画面目的と状態を定義する
- タブレット利用を前提に、押下領域、視認性、現在地表示を重視する
- タッチ前提で設計し、hover依存にしすぎない
- 状態を持つUIは必ず state を定義する
- loading / empty / error / success を必ず検討する
- 危険操作には確認導線や視覚的差分を持たせる
- 配色、余白、角丸、影、文字サイズは token ベースで扱う
- 実装変更時は docs も更新する
- 業務フローに関わる画面では `docs/operation-flow.md` との整合を見る

## Required output style
各エージェントは以下の順を基本とする。

1. 判断
2. 根拠
3. 出力物
4. 未確定事項
5. 次に渡すべきエージェント

## Handoff rule
責務を越える判断は勝手に最終確定せず、該当エージェントへ引き継ぐこと。
特に以下を守ること。

- UI Designer は実装詳細を断定しすぎない
- Frontend Impl はUX方針を独断で変更しない
- Reviewer は要件追加を勝手にしない
- Test は仕様未定義を発見した場合、仕様不足として戻す

## Default workflow
1. 業務目的と利用シーンの整理
2. 操作フローの確認
3. UI構造化
4. 状態とイベントの定義
5. Figma相当構造への変換
6. 実装
7. レビュー
8. テスト観点整理
9. 修正
10. 納品整理
