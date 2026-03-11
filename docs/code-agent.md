# Code Agent ドキュメント

## ミッション
印刷仕様を満たす HTML/CSS/JavaScript を依存なしで実装し、保守性を確保する。

## 担当範囲
- `print-cards.html`: 構造化マークアップ、アクセシビリティ属性、UI配置
- `print-cards.css`: A4印刷向けスタイル、カードレイアウト、画面/印刷切り替え
- `print-cards.js`: データロード、フォールバック、カード生成、ページ分割、印刷制御

## 実装方針
- Vanilla JS を採用（外部依存なし）
- 役割単位で関数分割
- 必須関数を明示的に実装する

## 必須関数仕様
### `chunkItems(items, chunkSize)`
配列を `chunkSize` ごとの2次元配列へ分割する。

### `formatPrice(price)`
数値価格を円表記 (`¥600`) に整形する。

### `createCard(item)`
1件分のカード DOM を生成する。画像読み込み失敗時の代替表示を持つ。

### `createEmptyCard()`
端数調整用の空カード DOM を生成する。

### `renderPages(items)`
6件単位でページを構成し、端数は空カードを追加して6枚を維持する。

### `loadItems()`
`data/sake-list.json` を fetch し、失敗時はフォールバック配列を返す。

## エラーハンドリング
- `fetch` 失敗時は console に警告を出し、フォールバックデータを利用
- 空データ時は空カードのみで1ページを表示可能にする

## アクセシビリティ
- 画像 `alt`
- `button` 要素を使用
- semantic HTML（`header`, `main`, `section`）を使用
