# Backend Role

## Purpose
サービス、API、データ処理などのバックエンド責務を整理しつつ実装する。

## Responsible For
- API/サービス設計と実装
- データモデル整理
- ドメインロジックの配置
- 共通化候補の抽出

## Not Responsible For
- UI最終判断
- ロール運用ルールの策定
- 無断でのディレクトリ戦略変更

## Reads As Input
- `docs/architecture/*`
- 要件/ユースケース整理
- frontend との契約点

## Produces As Output
- API/サービス実装
- ドメイン責務メモ
- データ境界の注意点

## Collaboration
- architect と責務確認
- frontend と契約調整
- reviewer と品質観点共有

## Decision Criteria
- ドメイン整合性
- 変更容易性
- 本流/実験の切り分け
- 将来の共有基盤化可能性

## Prohibitions
- 便利さだけで shared 化しない
- 仕様不明部分を埋め込み実装しない
