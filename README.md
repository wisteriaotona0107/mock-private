# 串カウント → ダーツ/射的 → おみくじ 特典アプリ

外部ライブラリなしのバニラ HTML/CSS/JS で動く、オフライン前提の店頭向けミニアトラクションです。

## ファイル構成

- `index.html` 画面構造（COUNTER / GAME / RESULT / ADMIN）
- `styles.css` 見た目・演出・レスポンシブ
- `app.js` ロジック（入力、抽選、描画、音、保存）
- `assets/` 任意（今回は未使用、CSS/Canvasで完結）

## 起動方法

1. このフォルダを端末に置く
2. `index.html` をダブルクリックで開く
3. 通常運用は `COUNTER` 画面で串本数を入力して `ゲーム開始`

> オフライン動作可。通信不要です。

## 運用手順（店員想定）

1. 店員が `+ / -` で串本数を入力
2. 画面に表示される回数で `ゲーム開始`
3. 客がドラッグして狙い、離して発射
4. 結果画面の特典を案内
5. `次のプレイ`（残回数あり）または `終了してカウンターへ`

## 仕様メモ

- プレイ回数換算は既定で `shots = floor(kushi_count / 2)`
- `kushi_count >= 3` のとき最低1回プレイ付与
- 視覚上は狙える演出だが、最終判定は確率テーブル抽選
- 狙いの良さで SSR/SR を最大 +2〜3% 程度補正
- 音ON時のみ WebAudio でSE合成（投擲 / ヒット / 勝利 / 残念）
- `navigator.vibrate` が使える端末のみ振動
- 粒子は端末FPSを見て自動で上限調整

## 管理画面（ADMIN）

- 右上ロゴ `🎯 KUSHI LUCK` を **3秒長押し** で開く
- JSON を編集して保存すると `localStorage` に反映
- `初期値へリセット` で既定設定に戻す

### 編集できる項目

`app.js` の初期値に対応します。

- `conversion.divisor` 串→回数の割り算係数
- `conversion.minKushiForOneShot` 最低1回が付く串本数閾値
- `conversion.minShots` 閾値を超えた時の最低回数
- `rareFailProb` 凶（特典なし）確率 `0.0〜0.05` 推奨
- `prizeTable` 各ランクの `prob`, `fortune`, `prize`
- `aimAssist.ssrMaxBoost`, `aimAssist.srMaxBoost` 照準補正量

### 確率/特典の編集例

```json
{
  "rareFailProb": 0.01,
  "prizeTable": {
    "SSR": { "prob": 0.02, "fortune": "超大吉", "prize": "会計無料" },
    "SR":  { "prob": 0.05, "fortune": "大吉", "prize": "ドリンク無料" },
    "R":   { "prob": 0.23, "fortune": "中吉", "prize": "100円引" },
    "N":   { "prob": 0.70, "fortune": "小吉", "prize": "また挑戦！" }
  }
}
```

## 設置のコツ

- iPad横向きを推奨（縦でも崩れない）
- 端末音量は中程度、必要ならミュート運用
- 1テーブル1端末で固定配置
