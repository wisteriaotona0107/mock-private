# 翻訳カードWebアプリ（HTML + JavaScript モック）

iPad mini を主対象にした翻訳カードWebアプリのモック実装です。HTML と JavaScript のみで構成し、
カードデータはローカル JSON、回答や履歴は localStorage に保存されます。

## 起動方法

簡易サーバーで静的ファイルを配信してください。

```bash
python -m http.server 5173
```

ブラウザで `http://localhost:5173` を開きます。

## データ追加方法

- `data/cards.json` にカードを追加してください。
- `data/categories.json` にカテゴリを追加できます。

`cards.json` の必須フィールド例：

```json
{
  "id": "card-001",
  "categoryId": "daily",
  "tags": ["daily"],
  "text": {
    "ja": "こんにちは",
    "en": "Hello",
    "zh": "你好",
    "ko": "안녕하세요"
  },
  "replyPresets": ["ok", "yes", "no", "wait", "custom"]
}
```

新しい言語を追加する場合は `assets/app.js` の `languageOptions` と `replyLabels` を拡張してください。

## localStorage キー

- `translation-cards.responses`: カードごとの直近回答
- `translation-cards.history`: 回答・メモ履歴（最大20件）
- `translation-cards.language`: 外国語表示の選択言語

## 仮定した仕様

- 外国語表示の選択言語は `EN / ZH / KO` の3つのみ選べる前提で UI を構成しています。
- `CUSTOM` は任意メモを外国語表示側にそのまま表示します。
- メモ保存は回答とは独立して履歴に追加されます（回答が未設定の場合は `idle` のまま履歴に残ります）。
