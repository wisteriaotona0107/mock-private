# UI Specification

## Purpose
この文書は、業務フローに沿ったタブレットUI仕様をまとめる基準文書である。

## Screen catalog
| Screen | Goal | Primary user | Primary action | Current location cue |
| --- | --- | --- | --- | --- |
| Example | 対象を選び、内容を確認して保存する | 店舗スタッフ | 内容更新 | サイドナビ + ヘッダー見出し |

## Layout principles
- タブレットでは左右分割、上部ステータス、固定アクションバーを優先検討する
- 立ち操作を想定し、主要アクションは視線移動と手の移動が少ない位置に置く
- 現在地は見出し、タブ、サイドナビ、パンくず等の複数手段で補強する
- 危険操作は一次導線から距離を置き、確認を伴わせる

## Interaction principles
- 保存、確定、戻る、閉じるは一貫配置にする
- hover に頼らず selected / current / focus を視覚化する
- loading / empty / error / success を画面全体と部品単位の両方で定義する
- スクロール量が増える場合は固定要素か分割表示で補助する

## Component checklist
- Header / page title
- Sidebar or tab navigation
- Main work area
- Context panel or detail panel
- Footer action bar
- Status banner / inline feedback
- Confirmation dialog or confirm section for risky actions

## Documentation rule
各画面仕様には以下を最低限含める。
- 画面目的
- 利用者
- 情報階層
- レイアウト構造
- コンポーネント一覧
- state一覧
- 危険操作の扱い
- レスポンシブ方針
