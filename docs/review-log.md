# review-log.md

## 対象
- `index.html`
- `assets/js/app.js`

## レビュー観点
1. `file://` 直開き時の表示可否
2. HTTP配信時の既存挙動維持
3. エラー時メッセージの明確さ
4. innerHTML 濫用禁止の順守

## レビュー結果
- `fetch()` 失敗時に埋め込みJSONへフォールバックするため、`file://` 環境でも表示可能。
- HTTP配信時は `assets/data/ai-workflow.json` の読込を優先し、既存フローを維持。
- 失敗時メッセージを「HTTP配信または埋め込みデータ確認」の行動案内つきに改善。
- DOM操作は `createElement` / `textContent` のみで、innerHTML濫用なし。

## 残課題
- JSONデータの二重管理（外部JSONと埋め込みJSON）が発生するため、将来的には生成スクリプト導入で同期自動化が望ましい。
