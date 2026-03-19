# agents/context-design-system.md

## Purpose
このファイルは、デザインと実装のズレを減らすための共通ルールを定義する。

## Core principles
- UIは token ベースで考える
- コンポーネントは再利用単位で分割する
- 状態差を明示する
- spacing を感覚で決めない
- 配色は意味ごとに定義する
- 危険操作、注意状態、正常状態を視覚的に区別する
- 文字サイズと余白は業務視認性を優先する

## Token categories
- color
- spacing
- radius
- shadow
- typography
- border
- motion
- elevation

## Suggested token naming
- color.bg.base
- color.bg.surface
- color.bg.panel
- color.text.primary
- color.text.secondary
- color.action.primary
- color.action.secondary
- color.status.success
- color.status.warning
- color.status.error
- spacing.xs / sm / md / lg / xl
- radius.sm / md / lg
- shadow.sm / md
- font.size.body / title / label / caption
- motion.fast / base / slow

## Component levels
- Atoms
- Molecules
- Organisms
- Layouts
- Pages

## State minimum set
状態を持つ要素は最低でも以下を持つ。
- default
- active
- focus
- disabled

必要に応じて追加する。
- selected
- expanded
- collapsed
- loading
- empty
- error
- success
- warning

## Interaction rules
- hoverだけで意味を成立させない
- focus を潰さない
- active と current を区別する
- 遷移アニメーションは短くし、業務速度を邪魔しない
- 重要状態は色だけでなく形やラベルでも示す

## Frontend handoff rule
実装へ渡す際は最低限以下を揃える。
- レイアウト構造
- コンポーネント一覧
- state一覧
- token一覧
- interaction要点
- レスポンシブ方針
- 危険操作の扱い
