# マスタメンテ Web アプリ (モック実装)

本リポジトリは Vanilla JS + Express で構成したマスタメンテ Web アプリのモック実装です。`npm install` → `npm run dev` でフロントエンドとモック API を同時起動し、ブラウザから CRUD を確認できます。

## 🏗 プロジェクト構成

```
project-root/
  README.md
  package.json
  frontend/
    index.html
    style.css
    app.js
    config.js
  mock-api/
    package.json
    server.js
    schema.md
    seed.js
    utils/
      paging.js
      errors.js
```

* フロントエンド: `frontend/` 配下の静的ファイル（ES Modules）。
* モック API: `mock-api/server.js` が Express ベースで起動します。
* ルート `package.json` は `concurrently` を使用してフロントと API を同時起動します。

## 🚀 起動方法

```bash
npm install
npm run dev
```

- フロント: http://127.0.0.1:3000
- API: http://127.0.0.1:3001

起動後、ブラウザで http://127.0.0.1:3000 を開くと一覧と編集フォームが表示されます。

## 🔌 API ベース URL

`frontend/config.js` の `window.APP_CONFIG.apiBase` を書き換えることで、API Gateway など任意のエンドポイントへ差し替え可能です。認証を追加する場合は `frontend/app.js` の `apiFetch` 関数でヘッダを拡張してください。

## 📜 モック API 仕様

詳細は `mock-api/schema.md` を参照してください。エンドポイントは本番 API を想定した DynamoDB 互換のスキーマ・レスポンス形に沿っています。

## 🔄 データ初期化

`mock-api/seed.js` で 10 件以上のマスタデータを定義しており、モック API 起動時に読み込まれます。永続化は行われません。

## ✅ 動作確認チェックリスト

- [ ] `npm install` → `npm run dev` でフロント(3000)と API(3001) が起動する
- [ ] 初期表示でデータが表に表示され、ページングが動作する
- [ ] 検索が `name`/`code` の部分一致でフィルタされる
- [ ] 新規作成で `version = 1` のレコードが作成されフォームに反映される
- [ ] 既存レコード更新で `version` が +1 される
- [ ] 競合（409）時にトーストで警告が表示される
- [ ] 削除で一覧から対象が消える
- [ ] ネットワーク/サーバエラー時に赤トーストが表示される

## 🔄 将来の AWS 差し替え

- `frontend/config.js` の `apiBase` を API Gateway の URL に変更するだけで接続先を切り替えられます。
- DynamoDB の `LastEvaluatedKey` は `mock-api/utils/paging.js` と同等の `nextToken` 形式に変換してください。
- 認証が必要な場合は `apiFetch` で `x-api-key` や `Authorization` ヘッダを追加して対応可能です。

## 🧹 開発メモ

- すべて UTF-8。日本語コメント可。
- フロントはビルド不要の Vanilla JS、CSS でシンプルな UI を実装しています。
- API は CORS 対応かつ 150–400ms の人工レイテンシを入れて動作検証しやすくしています。

