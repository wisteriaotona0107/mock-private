# data-model.md

## 1. 概要
公開側は `data/products.json` を読み込み、商品一覧/詳細に表示します。

## 2. 想定スキーマ
```json
{
  "generatedAt": "2026-03-09T10:00:00+09:00",
  "items": [
    {
      "id": "slot01",
      "name": "商品A",
      "price": 1800,
      "category": "日本酒",
      "description": "説明文",
      "mainImage": "/sites/pj-a/prod/assets/sake/slot01/main.jpg",
      "thumbImage": "/sites/pj-a/prod/assets/sake/slot01/thumb.jpg",
      "visible": true,
      "sortOrder": 10
    }
  ]
}
```

## 3. 項目定義
### ルート
- `generatedAt` (string, 任意)
- `items` (array, 必須)

### 商品
- `id` (string, 実装上必須扱い)
- `name` (string, 実装上必須扱い)
- `price` (number|string, 任意)
- `category` (string, 任意)
- `description` (string, 任意)
- `mainImage` (string, 任意)
- `thumbImage` (string, 任意)
- `visible` (boolean, 推奨必須)
- `sortOrder` (number, 任意)

## 4. 異常値の扱い
- `items` が配列でない: エラー表示
- 商品要素がobjectでない: 除外
- `visible !== true`: 非表示
- `id` 欠損: 除外
- `name` 欠損: 除外
- `price` 異常/欠損: `価格未設定`
- `category` 欠損: `カテゴリ未設定`
- `description` 欠損: 既定文言
- 画像パス不正/欠損: フォールバック画像

## 5. 表示ルール
- 一覧画像は `thumbImage` 優先、なければ `mainImage`
- 説明は一覧で省略表示(最大80文字)
- 並び順は `sortOrder` 昇順、未設定は後方
- 同一順序は元データ順を維持
