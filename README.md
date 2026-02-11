# 日本酒フレーバーマップ デモ

iPhone / iPad Safari で「触って気持ちいい」ことを最優先にした、依存ゼロのデモWebアプリです。`demo/index.html` を開くだけで動作します。

## フォルダ構成

```
demo/
  index.html
  style.css
  app.js
  sample-data.json
docs/
  sequence.mmd
  slides.md
  architecture.md
README.md
```

## 起動方法

- ローカルで `demo/index.html` をブラウザで開く（オフライン可）
- iPhone / iPad Safariで開くとタップ操作や下部UIの挙動が分かりやすい

## 主な機能

- 1画面完結UI（主操作は下部）
- Canvasベースの2Dフレーバーマップ
- 点タップ: パルス反応 + 下部詳細カード表示
- タグ複数選択 + ★お気に入りのみフィルタ
- JSONの読み込み（サンプル/ファイル/貼り付け）
- `dataset` / `favorites` / `filters` を localStorage に保存して復元

## 入力JSON仕様

入力は **単体オブジェクト** または **配列** を許容します。

- 単体 `{ ... }` は内部で `[ { ... } ]` に正規化
- 必須: `brandId`, `brandName`, `breweryName`, `areaName`, `flavor`
- `flavor` は `f1..f6` を想定（0..1推奨、欠損は0補完）
- `tags` は任意の文字列配列

### JSON例

```json
{
  "brandId": 123,
  "brandName": "銘柄名",
  "breweryId": 10,
  "breweryName": "蔵元名",
  "areaId": 13,
  "areaName": "東京都",
  "flavor": { "f1": 0.2, "f2": 0.4, "f3": 0.1, "f4": 0.6, "f5": 0.3, "f6": 0.5 },
  "tags": ["フルーティ", "辛口"]
}
```

## flavor -> 2D マッピング

- `clamp01(v) = max(0, min(1, v))`
- X（フルーティ ↔ 辛口）
  - `x = clamp01(f1 * 0.7 + f3 * 0.3)`
- Y（淡麗 ↔ 濃醇）
  - `y = clamp01(f4 * 0.6 + f6 * 0.4)`

## 操作

- 下部 `JSON` ボタン: ボトムシートを開く
- `サンプル投入`: 内蔵サンプルを即反映
- `ファイル選択`: `.json` をロード
- `貼り付け + 読み込み`: textareaのJSONを反映
- 点タップ: 詳細カード表示
- カード内 `★`: お気に入りトグル
- カードは下方向スワイプで閉じる

## 設計可視化資料

- シーケンス図: `docs/sequence.mmd`
- Marpスライド: `docs/slides.md`
- 簡易アーキテクチャ: `docs/architecture.md`
