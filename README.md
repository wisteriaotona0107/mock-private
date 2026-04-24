# mock-private

Swift / SwiftUI 前提で作り直したローカル完結モックです。

## 構成

- `ios-mock/RouteMockApp.swift` : エントリポイント
- `ios-mock/ContentView.swift` : 画面UI（可変グリッド、履歴、AI貼り付け欄、エクスポート表示）
- `ios-mock/Models.swift` : 状態モデル
- `ios-mock/RouteStore.swift` : ローカルJSON保存、状態更新、CSV/Markdown/Mermaidテキスト生成

## 実装方針

- 通信処理なし（完全ローカル）
- データは `Documents/route_state.json` に保存
- Mermaidは描画ではなく文字列生成のみ
- CSV / Markdown / Mermaid をエクスポートする想定で文字列出力
- AI API連携は未実装。TextEditorへ貼り付け運用

## 補足

このリポジトリには Xcode プロジェクト本体（`.xcodeproj`）は含めていません。
必要であれば iOS App プロジェクトを新規作成し、`ios-mock` 配下の Swift ファイルを追加して動作確認できます。
