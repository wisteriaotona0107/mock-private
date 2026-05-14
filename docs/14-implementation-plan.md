# 14 Implementation Plan

## 技術比較

### Swift + SwiftUI
- 長所: 画面遷移/状態管理が実装しやすい、iOS標準との親和性
- 短所: 高頻度2D演出は工夫が必要

### SwiftUI + SpriteKit（推奨）
- 長所: UIはSwiftUI、プレイ体験はSpriteKitで分離しやすい
- 短所: 状態同期設計を丁寧に行う必要

### Swift + UIKit + SpriteKit
- 長所: 細かい制御
- 短所: 初期開発コストが高い

## 推奨構成
- UIシェル: SwiftUI
- コアプレイ: SpriteKit
- ロジック: 純Swiftモジュール（データ駆動）
- データ: JSON定義（髪型/イベント/カード）

## 実装フェーズ案
1. Vertical Slice（1ターン分）
2. 5ターン進行 + 評価
3. カード選択とビルド
4. インフルエンサーイベント
5. エンドレスモード
6. 素材本差し替え
