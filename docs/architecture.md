# architecture.md

## 全体構成
- `index.html`: セクションの骨組みとアクセシブルな文書構造
- `assets/css/style.css`: 見た目、レイアウト、レスポンシブ
- `assets/js/app.js`: JSON読込・検証・DOM描画
- `assets/data/ai-workflow.json`: 表示データの単一ソース

## 実行モデル
- ビルド不要
- 静的配信（HTTPサーバでそのまま配信可能）
- 外部依存なし（Vanilla HTML/CSS/JS）

## データフロー
1. ページ読込
2. `app.js` が `ai-workflow.json` を fetch
3. 配列構造の最低限バリデーション
4. DOMへ段階的に描画

## 変更指示（初版）
- 追加機能は「静的配信可能」「外部依存最小」を維持すること。
