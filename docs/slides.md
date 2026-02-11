---
marp: true
theme: default
paginate: true
---

# 日本酒フレーバーマップ（iPhone/iPad Safari向け）

- 依存ゼロ（Vanilla HTML/CSS/JS）
- 1画面完結、主操作は下部UI
- オフライン動作（localStorage復元）

---

## データ -> 可視化

1. JSON入力（単体 or 配列）
2. 正規化・必須項目チェック・flavor補完
3. flavor(f1..f6) から2D座標へ投影
   - X = f1*0.7 + f3*0.3
   - Y = f4*0.6 + f6*0.4
4. Canvasで点（小さな丸）を軽量描画

---

## UX見せ場（30秒デモ）

- 点タップで「必ず反応」: パルス + 下部カード表示
- カード: タグ + f1..f6ミニバー（順次アニメ）
- タグ複数選択 + ★お気に入りのみフィルタ
- JSON差し替え即反映、再起動後も状態復元
