# Derby Pusher MVP (SwiftUI + SpriteKit)

## 1) 仕様の要点まとめ
- **競馬×プッシャー**のカジュアルゲームを最短で動くMVPとして実装。
- **iPad横画面を基準**に上段Race / 下段Pusher / 下端カード帯の3エリア構成。
- **SwiftUIでUI**、**SpriteKitでゲーム描画**（RaceScene / PusherSceneの2シーン）。
- **ロジックはViewModelに集約**し、Sceneとはイベント連携のみ。
- **オフライン**、**ローカル保存**（UserDefaults + JSON）。

## 2) 状態遷移（GameState）
- `idle`：Home/ゲーム開始直後の待機。
- `betting`：馬選択済み・ベット入力中。
- `racing`：BET確定後、RaceSceneが走行。
- `result`：レース完了・払い戻し結果表示。

遷移タイミング
- `idle` → `betting`：馬を選択。
- `betting` → `racing`：BETボタン押下でベット確定。
- `racing` → `result`：RaceScene完走・結果通知。
- `result` → `idle`：リトライで次レース準備。

## 3) ディレクトリ構成
```
HorsePusherMVP/
  Sources/
    App/
      HorsePusherMVPApp.swift
    Models/
      GameModels.swift
      DataStore.swift
    ViewModels/
      GameViewModel.swift
    Scenes/
      RaceScene.swift
      PusherScene.swift
    Views/
      RootView.swift
      HomeView.swift
      GameDashboardView.swift
      Panels.swift
      ResultView.swift
      Theme.swift
  Resources/
    GameConfig.json
    HorseData.json
    ItemData.json
```

## 4) 主要ファイルの完全実装コード
- `HorsePusherMVP/Sources` 以下にすべて実装済み。
- ViewModel/Scene/Viewの責務分離、Config/JSON読み込みを含む。

## 5) JSONサンプル（3ファイル）
- `Resources/GameConfig.json`
- `Resources/HorseData.json`
- `Resources/ItemData.json`

## 6) 拡張ポイント（3つ）
1. **実データ導入**：Race結果ロジックを外部データ/サーバ連携に差し替え。
2. **馬券方式追加**：単勝以外（複勝・馬連・三連複）をBetPanelに拡張。
3. **演出強化**：RaceScene/PusherSceneでパーティクルやカメラ演出を追加。

---

## How to run (Xcode)
1. 新規iOSプロジェクトに `Sources` を追加。
2. `Resources` のJSONをCopy Bundle Resourcesに追加。
3. `HorsePusherMVPApp.swift` をAppエントリとして起動。

