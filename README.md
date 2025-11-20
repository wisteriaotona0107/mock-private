# 日本酒バー「霧島」サイトモック

小規模日本酒バー向けの静的サイトモックです。トップ/日本酒一覧/メニュー更新/店舗情報/ギャラリー/お知らせ/予約フォーム/管理UIを含み、JSON を更新するだけで内容を差し替えできます。

## ディレクトリ
- `public/`: サイト本体。`data/` 配下の JSON を参照します。
- `design/`: Figma プロンプトや配色/ワイヤーフレームメモ。
- `slides/`: Marp 形式の紹介スライド。
- `docs/`: Xserver を想定したデプロイ手順。

## 主要ページ
- `index.html`: トップ + 各セクションまとめ。
- `sake.html`: 日本酒一覧（フィルター付）。
- `menu.html`: メニュー更新の確認テーブル。
- `news.html`, `gallery.html`, `info.html`, `reserve.html`: 各専用ページ。
- `admin.html`: 日本酒/メニュー CRUD、並び替え、画像パス採番、JSONダウンロード。

## データ差し替え
- `public/data/sake.json`: 日本酒ラインナップ。
- `public/data/menu.json`: 本日のおすすめ。
- `public/data/news.json`: お知らせ。
- `public/data/gallery.json`: ギャラリー画像パス（相対）。

## 動作確認
静的 HTML のためローカルで `public/` を開くか、任意の HTTP サーバーで配信してください。
