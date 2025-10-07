# モック API スキーマ

モック API は Express で実装された DynamoDB 想定のエンティティを返却します。ベース URL は `http://127.0.0.1:3001` です。

## 共通仕様

- `Content-Type: application/json`
- CORS 許可 (`Access-Control-Allow-Origin: *`)
- レイテンシ: 150–400ms の人工遅延
- エンティティ構造:

```json
{
  "id": "string-uuid",
  "code": "string",          // <= 64
  "name": "string",          // <= 128
  "description": "string",   // 任意
  "enabled": true,
  "version": 1,
  "createdAt": "ISO-8601",
  "updatedAt": "ISO-8601"
}
```

## エンドポイント

### `GET /items`

クエリパラメータ:

- `q` (任意): `code` / `name` に対する部分一致検索（小文字比較）
- `limit` (任意): 1–100。既定値 20。
- `nextToken` (任意): `mock-api/utils/paging.js` の base64 トークン。

レスポンス:

```json
{
  "items": [Item...],
  "nextToken": "base64-token" | null
}
```

### `GET /items/:id`

指定 ID のアイテムを返却します。存在しない場合は `404`。

### `POST /items`

リクエストボディ:

```json
{
  "code": "string",          // 必須、<=64
  "name": "string",          // 必須、<=128
  "description": "string",   // 任意
  "enabled": true             // 任意、省略時 true
}
```

レスポンス: `201 Created` + 作成されたアイテム。

### `PUT /items/:id`

リクエストボディ:

```json
{
  "code": "string",          // 任意
  "name": "string",          // 任意
  "description": "string",   // 任意
  "enabled": true,            // 任意
  "version": 1                // 必須、楽観ロック
}
```

- `version` が一致しない場合は `409 { "message": "ConditionalCheckFailed" }`
- 更新後は `version` が +1 され `updatedAt` が更新されます。

### `DELETE /items/:id`

クエリパラメータ:

- `version` (任意): 指定時は一致必須。不一致で `409`。

レスポンス:

```json
{ "ok": true, "deletedId": "..." }
```

## ページング

`utils/paging.js` で `LastEvaluatedKey` 風トークンを base64 文字列として生成・復元しています。`nextToken` を `GET /items` の `nextToken` クエリに渡すことで次ページを取得できます。

## エラー

- `400 Bad Request`: バリデーションエラー
- `404 Not Found`: 対象が存在しない
- `409 Conflict`: 楽観ロック競合 (`ConditionalCheckFailed`)
- `500 Internal Server Error`: 上記以外の予期しないエラー

`mock-api/utils/errors.js` に例外クラスとエラーハンドラを定義しています。
