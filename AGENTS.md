# AGENTS.md

このリポジトリでは、印刷カード機能を **Design Agent** と **Code Agent** の協調で実装します。

## Agent Roles

### Design Agent
- カードレイアウト設計（画像・銘柄名・説明・価格・ID の配置）
- 余白設計と可読性の最適化
- タイポグラフィ設計（見出し・本文・価格強調）
- 印刷時の安定性（A4縦 / 大判1カード）
- 和モダン・上質・ミニマルのデザイン整合性
- チラシ用途でも成立する全体ビジュアル設計

### Code Agent
- `print-cards.html` / `print-cards.css` / `print-cards.js` の実装
- JSON 読み込みとフォールバック処理
- カード生成ロジック・ページ分割ロジック実装
- 印刷ボタンと印刷モード制御
- 長い銘柄名・説明文でも破綻しない実装

## Collaboration Rules
- Design Agent は UI/印刷デザイン要件を定義し、Code Agent はそれを忠実に実装する。
- 実装中に要件競合が発生した場合、次の優先順で判断する:
  1. 印刷仕様（A4, 1 large card per page）
  2. 情報優先順位（画像 > 銘柄名 > 価格 > 説明）
  3. 和モダン・ミニマルな見た目
- データモデルは以下 5 項目のみ使用する: `id`, `name`, `desc`, `img`, `price`

## Implementation Order
1. `AGENTS.md`
2. `docs/requirements-print-cards.md`, `docs/code-agent.md`, `docs/design-agent.md`
3. `print-cards.html`
4. `print-cards.css`
5. `print-cards.js`

## Quality Gate
- 依存ライブラリなし（Vanilla HTML/CSS/JS）
- semantic HTML / alt / button を満たす
- 印刷時に説明・UI・ボタンが非表示
- カード外形は角丸を使わず、切り取りしやすい角ばったデザインを維持
