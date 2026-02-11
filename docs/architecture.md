# Architecture (Demo)

- `demo/index.html`: 1画面構成（Canvas + ボトムバー + シート + カード）。
- `demo/style.css`: iOS Safari向けの軽量UI、短いトランジション中心。
- `demo/app.js`: 状態管理、JSON正規化、Canvas描画、localStorage永続化。

## Rendering policy

- 背景グリッドは毎回描画。
- 点は可視対象だけ描画し、出現時200msのフェード/スケール。
- タップ時は120msパルス。

## Persistence

- `dataset`, `favorites`, `filters` をそれぞれキー分離で保存。
- 起動時に復元失敗した場合はトースト通知しサンプルへフォールバック。
