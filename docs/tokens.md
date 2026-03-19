# Design Tokens

## Purpose
この文書は、業務タブレットUIで共通利用する token 設計の基準を定義する。

## Token policy
- token 名は意味ベースで付ける
- 色だけで意味を持たせず、境界線、ラベル、アイコンも併用する
- 余白と文字サイズは読みやすさと押しやすさを優先する

## Recommended tokens
### Color
- color.bg.base
- color.bg.surface
- color.bg.panel
- color.bg.selected
- color.text.primary
- color.text.secondary
- color.text.inverse
- color.border.default
- color.action.primary
- color.action.primary-pressed
- color.action.secondary
- color.status.success
- color.status.warning
- color.status.error
- color.status.info
- color.danger.base
- color.danger.surface

### Spacing
- spacing.xs: 4
- spacing.sm: 8
- spacing.md: 12
- spacing.lg: 16
- spacing.xl: 24
- spacing.2xl: 32

### Radius
- radius.sm
- radius.md
- radius.lg

### Typography
- font.family.base
- font.size.caption
- font.size.body
- font.size.label
- font.size.title
- font.weight.regular
- font.weight.semibold
- line.height.compact
- line.height.base

### Motion
- motion.fast
- motion.base
- motion.slow

## Ergonomic defaults
- 主要ボタン高さは十分に確保する
- 行間は立ち操作でも判読しやすい値にする
- 一覧項目は密集させすぎない
