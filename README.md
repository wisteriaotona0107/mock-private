# 飲食店向け絵カード注文支援（MVP）

## 概要
このプロジェクトは、飲食店での意思表示を支援する **絵カード式コミュニケーション支援Webアプリ** です。  
言葉で伝えづらい場面でも、AACコミュニケーションカードを選択して文を作り、視覚表示＋音声で伝えられます。

## 使い方
1. `index.html` をブラウザで開きます（静的ホスティング可）。
2. 左のカテゴリから選択します。
3. 中央のカードをタップすると、右の文構築エリアに追加されます。
4. 右エリアで「← / → / ✕」で順序変更・削除します。
5. 「よみあげ」で文全体を読み上げ、「ぜんぶけす」で全削除します。
6. カード内の「よむ」でカード単体読み上げができます。

## JSONの編集方法
- `data/categories.json`：カテゴリ定義
- `data/cards.json`：カード定義（JSON駆動）
- `data/settings.json`：初期利用者設定

### categories.json
- `id`, `label`, `color`, `icon`, `sort_order`, `active`

### cards.json
1件ごとに以下を保持:
- `id`
- `label`
- `reading`
- `category_id`
- `image_type` (`symbol` / `photo` / `ai` / `ui`)
- `image_src`
- `tags`
- `favorite`
- `active`
- `sort_order`

### settings.json
- `theme`, `cardSize`, `speechRate`, `speechEnabled`, `highContrast`, `showLabels`, `locale`

## 画像差し替え方法
1. `assets/cards/<category>/` に画像を配置
2. `cards.json` の `image_src` を更新
3. ファイルがない場合は `assets/ui/placeholder-card.svg` に自動フォールバック

## カード追加方法
1. `cards.json` にカードオブジェクトを追加
2. `category_id` は `categories.json` の `id` と一致させる
3. `sort_order` で表示順を調整
4. `active: true` で表示対象

## テーマ変更方法
- 設定ダイアログで `soft-warm` / `high-contrast` を切替
- CSS変数は `css/themes.css` で管理
- `highContrast` をONにすると高コントラストを強制適用

## 読み上げ仕様
- Web Speech API（`speechSynthesis`）を使用
- カード単体読み上げと文全体読み上げに対応
- `speechRate` と `locale` を設定値から反映
- 未対応ブラウザではエラーメッセージ表示（クラッシュしない）

## 注意点
- 本MVPはピュアHTML/CSS/JavaScriptのみ
- npmやビルドツールは不要
- localStorage不可環境では、最近使ったカードや設定保存が永続化されません

## 将来拡張案
- 管理画面（カードCRUD）
- 多言語切替（英語・やさしい日本語）
- 音声候補（Voice）選択
- サーバ同期（店舗共通設定）
- PWA化・オフライン対応
- ログ分析（よく使うカード可視化）
