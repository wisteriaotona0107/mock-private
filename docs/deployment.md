# デプロイ/運用手順（Xserver 想定）

## ディレクトリ構成
```
public/
  index.html
  sake.html
  menu.html
  news.html
  gallery.html
  info.html
  reserve.html
  admin.html
  styles.css
  app.js
  sake.js
  menu.js
  news.js
  gallery.js
  admin.js
  data/
    sake.json
    menu.json
    news.json
    gallery.json
  images/
    gallery/ (撮影写真を配置)
```

## アップロード
1. Xserver のサーバーパネル → ファイル管理 → `public_html` 配下に `public` ディレクトリごとアップロード。
2. 画像は `public/images/gallery/` に配置し、`gallery.json` の `src` を相対パス（例: `images/gallery/img_202406102230.jpg`）で記載。
3. JSON を更新するたびに `data/` 配下を上書き。ブラウザキャッシュが残る場合は `?v=timestamp` を付与。

## JSON と HTML の紐付け
- `app.js` / `sake.js` / `menu.js` などが `public/data/*.json` をフェッチして描画。
- バックエンド不要。HTTPS環境で fetch が動くよう、同一ドメイン上に配置してください。

## メニュー更新フロー
1. `admin.html` をローカルで開く。
2. 日本酒/メニューを編集 → `JSONを書き出す` ボタンで `sake.json` / `menu.json` をダウンロード。
3. Xserver の `public/data/` に上書きアップロード。
4. トップページのキャッシュ更新後、即反映。

## 予約フォーム連携
- 現状はダミー alert。Googleフォーム or 独自 API（Node/PHP）に `fetch` で POST する処理を追加して運用。

## バックアップ
- 月次で `public/data/` と `public/images/` をローカルに保存。
- GitHub / GitLab でバージョン管理すると安全です。
