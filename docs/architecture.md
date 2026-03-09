# architecture.md

## 1. 概要
公開側は静的HTML / CSS / JavaScriptで構成し、`data/products.json` を `fetch` で取得して描画します。公開側はWordPressやDBに直接アクセスしません。

## 2. 構成
```text
/
  index.html
  products/index.html
  assets/css/style.css
  assets/js/app.js
  assets/js/api.js
  assets/js/dom.js
  assets/js/utils.js
  assets/img/fallback-product.svg
  data/products.json
  docs/*.md
```

## 3. JS責務分割
- `app.js`: ページ判定、初期化、状態遷移入口
- `api.js`: `products.json` 取得とレスポンス検証
- `dom.js`: DOM生成、一覧/詳細描画、状態表示
- `utils.js`: 値整形、ソート、クエリ取得、画像フォールバック

## 4. 画面構成
### 一覧画面 (`index.html`)
- ヘッダー
- 状態表示領域
- 商品カード一覧
- フッター

### 詳細画面 (`products/index.html`)
- 状態表示領域
- 商品詳細(画像/価格/カテゴリ/説明)
- 一覧へ戻るリンク

## 5. データ読み込み方式
- `fetch('/data/products.json')` でJSONを取得
- `items` が配列でない場合は異常扱い
- `visible === true` のみ表示対象
- `sortOrder` 昇順(未設定は後方)

## 6. エラー方針
- JSON取得失敗: 画面に簡潔なエラーメッセージ
- JSON形式異常: 同上で処理中断
- 商品0件: 空状態メッセージ
- 詳細ID不正: 商品未検出メッセージ

## 7. フォールバック方針
- 画像欠損: `/assets/img/fallback-product.svg`
- 価格欠損: `価格未設定`
- カテゴリ欠損: `カテゴリ未設定`
- 説明欠損: `説明はありません。`

## 8. セキュリティ方針
- JSON由来文字列は `textContent` で描画
- `href/src` は固定パスまたは検証済み値のみ設定
- 内部エラー詳細はUIに露出しない
- 認証情報、管理URLは静的フロントへ置かない
