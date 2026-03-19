# agents/context-product.md

## Purpose
このファイルは、全エージェントが共有する業務タブレットUIの基本文脈を定義する。

## Product assumptions
- 対象は主に業務タブレットUIである
- 利用者は店舗スタッフ、現場作業者、受付担当者、管理者などを含む
- 利用環境は立ち操作、移動中操作、短時間確認、繰り返し操作が多い
- 実装対象は主にWebフロントエンド
- pure HTML / CSS / JavaScript でのモックまたは実装を優先可能
- 将来的に WordPress / JSON / API / 業務データ連携へ拡張可能

## Design philosophy
- 迷わない
- 押しやすい
- 現在地が分かる
- 一目で状況が分かる
- 業務速度を落とさない
- 誤操作しにくい
- 読みやすい
- 静かで落ち着いた情報設計

## Operational expectations
- 操作回数を減らす
- よく使う操作を前に置く
- 危険操作を分離する
- 一時的な状態変化を見逃させない
- 片手操作でも扱いやすい構造を意識する
- 長文説明よりも明快なラベルを優先する

## Non-functional expectations
- レスポンシブ
- アクセシビリティ
- タッチ操作適性
- 保守性
- 再利用性
- 状態管理の明確化
- 視認性の高さ

## Default device assumptions
明示がなければ以下を仮定する。
- Tablet first
- 画面幅 768px〜1366px 程度を主対象
- タッチ操作あり
- 屋内利用を主想定
- 短い注視時間でも判断しやすい必要がある

## Common artifact expectations
- docs/requirements.md
- docs/operation-flow.md
- docs/ui-spec.md
- docs/tokens.md
- docs/data-schema.md
- docs/test-strategy.md

## Communication rule
抽象語は必ずUI特性へ分解すること。
例:
- 「業務向け」→ 押下領域十分、導線短い、誤操作防止、現在地明確
- 「見やすい」→ 情報量整理、文字サイズ適正、コントラスト適正、余白整理
- 「使いやすい」→ 主要アクション近接配置、階層浅め、戻りやすい、状態明快
