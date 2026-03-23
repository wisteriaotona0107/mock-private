# Target State

## Goal
将来の目標は、単発試作を追加していく倉庫ではなく、複数のプロダクト候補や機能群を継続運用できる「プラットフォーム型リポジトリ」にすることです。

## Design Principles
- 実験と本流を分ける
- 実装と文書の責務を分ける
- アプリ固有と共通基盤を分ける
- 人間向け説明とAI向け運用ルールを両立させる
- 現状と構想を同じ文書内で混同しない

## Desired Layering
将来的には少なくとも以下の層で整理される状態を目指します。

1. **Experience / Product layer**
   - 個別アプリ、機能、ユーザー体験
2. **Domain / Business layer**
   - ルール、ユースケース、共通概念
3. **Platform / Shared layer**
   - 共通UI、共通SDK、設定、認証、データアクセスなど
4. **Operations layer**
   - テスト、CI、デプロイ、運用ルール、監視
5. **Documentation & Agent layer**
   - 設計文書、意思決定記録、ロール定義、AI運用ガイド

## Proposed Repository Shape
実装が増えた際の候補構成は以下です。これは確定ではなく、現時点の推奨叩き台です。

```text
apps/           # 個別プロダクト・フロント群
services/       # APIやバックエンドサービス群
packages/       # 共通ライブラリ・UI・SDK
infra/          # インフラ設定、IaC、デプロイ関連
scripts/        # 運用/補助スクリプト
docs/           # 設計・運用・vision・roadmap
agents/         # AI/role定義
experiments/    # 試作・検証・短命なもの
```

## What “Platform” Must Include
最低限 platform と呼ぶために必要なもの:

- 共通ルール
- 再利用可能な部品
- 役割ごとの責務分離
- 変更影響を把握しやすい構造
- ドキュメントと実装が結びつく運用

## Responsibility Boundaries
### Apps / Services
- 個別価値の提供
- ただし共通実装を埋め込みすぎない

### Packages / Shared
- 再利用性を優先
- アプリ固有仕様を持ち込まない

### Docs
- 現在地、判断理由、運用ルールを残す
- 実装の代替ではなく、実装を支える土台

### Agents
- 役割定義と作業順序を明確にする
- 人間が見ても運用意図を理解できる内容にする

## Operational Characteristics of the Target State
- 小さな変更でも関連文書更新がセットになる
- 実験コードは本流に混ぜない
- 設計変更は段階化して扱う
- Codex単独でも複数AIでも迷いにくい
- 外部説明時に、現状と構想を分けて見せられる

## Non-Goals
目標状態は、最初から巨大なモノレポ化や複雑なインフラ導入を意味しません。

- 今すぐ全層を実装することは目標ではない
- 先に構造だけ増やして空ディレクトリだらけにすることも目標ではない
- 「見た目が整っているだけ」の整理は避ける

## To Be Confirmed
- どのランタイム/言語を中心に据えるか
- 単一アプリ起点か、複数プロダクト起点か
- 外部公開前提の境界がどこか
- データと認証の共通基盤が本当に必要か
