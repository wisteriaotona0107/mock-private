# HanamiSeatMock (Swift / SwiftUI)

ローカル完結の iOS モックアプリです。通信処理は含まず、席取り記録は JSON で端末ローカル保存します。

## 構成
- `HanamiSeatMock/HanamiSeatMockApp.swift`: エントリポイント
- `HanamiSeatMock/Views/ContentView.swift`: 入力・ログ・エクスポートUI
- `HanamiSeatMock/ViewModels/HanamiGameViewModel.swift`: スコア計算、保存、エクスポート
- `HanamiSeatMock/Models/HanamiModels.swift`: モデル定義
- `HanamiSeatMock/Persistence/LocalSessionStore.swift`: JSON永続化
- `HanamiSeatMock/Resources/sample_sessions.json`: サンプルデータ

## 実装前提への対応
- Swift / SwiftUI ベース
- ローカルモック（API通信なし）
- JSONファイル保存
- Mermaid はテキスト表示
- CSV / Markdown / Mermaid エクスポート文字列生成を実装
- AI連携は未実装、入力欄へAI出力貼り付け方式

## 使い方
1. Xcode で iOS App プロジェクトへ各ファイルを追加
2. `ContentView` を表示
3. 入力して「スコア再計算」「保存」を実行
4. エクスポート欄で各形式をコピー
