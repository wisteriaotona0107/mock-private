---
marp: true
theme: default
paginate: true
headingDivider: 2
---

# 日本酒バー「霧島」サイトモック
- 小規模日本酒バー向け即納用テンプレ
- JSON + 静的HTMLで運用簡単
- 管理UIモック付属

---
## 1. サイト構成
- トップ（ヒーロー、ナビ）
- 日本酒一覧（フィルター付）
- 本日のおすすめ（メニュー）
- お知らせ
- ギャラリー
- 店舗情報（地図ダミー）
- 予約フォーム（ダミー送信）
- 管理UI / メニュー更新ページ

---
## 2. デザインキー
- 配色: 背景#0f0d0a / カード#181512 / アクセント#b97f2a / テキスト#f4f1e8
- マテリアル: 木目 + 和紙 + ゴールドアクセント
- タイポ: Noto Sans JP + Playfair Display
- シャドウ: 0 20 60 rgba(0,0,0,0.35)

---
## 3. JSON 連携
- `data/sake.json`: 日本酒一覧
- `data/menu.json`: 本日のおすすめ
- `data/news.json`: お知らせ
- `data/gallery.json`: ギャラリー画像パス（相対パス）
- 変更はアップロードだけで即反映

---
## 4. 管理UIモック
- 日本酒 CRUD（名称/蔵元/精米歩合/提供温度/画像URL）
- メニュー CRUD + 並び替え
- 画像パス採番ジェネレータ
- JSON ダウンロード（sake.json, menu.json）

---
## 5. デプロイ想定
- Xserver の public_html 配下に `public/` を配置
- `public/data/` に JSON、`public/images/` に写真
- `.htaccess` 不要の静的構成

---
## 6. 運用メモ
- 画像は後で店舗撮影に差し替え
- 予約フォームは Googleフォームや自前APIに接続
- 週次で menu.json / news.json を更新
