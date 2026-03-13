# implementation.md

## 実装ルール
- Pure HTML/CSS/JavaScript
- 相対パスで動作
- innerHTML の濫用禁止

## 責務分離
- HTML: 構造とランドマーク
- CSS: レイアウトと見た目
- JS: データ取得・検証・DOM生成
- JSON: 文言とフロー定義

## エラーハンドリング
- JSON取得失敗時はメッセージ表示
- 不正フォーマット時も描画せず通知

## 今回の成果物
- `index.html`
- `assets/css/style.css`
- `assets/js/app.js`
- `assets/data/ai-workflow.json`

## 変更指示（初版）
- 機能追加時は同様の責務分離を維持し、データ主導で拡張すること。
