# test-strategy.md

## テスト方針
- 構文チェックを最小限の必須チェックとする
- 静的配信での実表示を確認する
- モバイル幅での可読性を優先確認する

## 基本チェック
- JSON構文: `python3 -m json.tool assets/data/ai-workflow.json`
- JS構文: `node --check assets/js/app.js`
- 表示確認: `python3 -m http.server <port>`

## 観点
- 必須セクションがすべて表示される
- エラー時メッセージが表示される
- 画面幅に応じてレイアウトが破綻しない

## 変更指示（初版）
- 将来、CIを導入する場合は上記チェックを最初に自動化すること。
