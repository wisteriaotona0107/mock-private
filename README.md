# Lite Games x10 (SwiftUI / iOS 18+)

通信なし・ローカル保存(UserDefaults)のみで動く、SwiftUI製の軽いゲーム集です。

## 構成
- `GameHubApp.swift` エントリポイント
- `Models/` ゲーム識別とスコア型
- `Services/` スコア保存・ハプティクス
- `UI/` ハブ、共通コンテナ、結果画面
- `Games/` 10本の独立ゲーム実装

## スコア保存キー設計
- `ScoreStore` は `score.record.<gameRawValue>` のキーで `ScoreRecord` (JSON) を保存。
- `ScoreRecord` には `score(直近) / best / plays / lastPlayed` を保持。

## ゲーム追加方法（拡張ポイント）
1. `GameID` にケース・タイトル・説明を追加。
2. `Games/` に `XX_NewGameView.swift` を追加し、`GameContainerView` を利用して `start/pause/resume/reset/finish` を実装。
3. `GameSelectionView.destination(for:)` に遷移追加。
4. 終了時に `scoreStore.saveScore(for:score:)` を必ず呼ぶ。

> すべてのゲームは Shapes/Gradient/Text だけで描画しているため、将来的に画像・音に差し替えしやすい構造です。
