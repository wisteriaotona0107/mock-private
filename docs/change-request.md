# change-request.md

## 背景
`ai-workflow.json` が読み込めない報告あり。
原因は `fetch()` が `file://` 直開き環境で失敗しやすく、ローカルHTTPサーバ起動を前提としていたため。

## 修正指示
1. `localhost` 前提をなくす。
2. `file://` 環境でもページが表示されるようにする。
3. 既存の `assets/data/ai-workflow.json` は保持し、HTTP配信時は従来どおり利用する。
4. エラー時の案内文は、次アクションがわかる表現に改善する。

## 受け入れ条件
- `file://` 直開きで主要コンテンツ（phases/tools/review/security）が表示される。
- HTTP配信でも従来どおりJSON読み込みで表示される。
- 失敗時は無言で空画面にならない。
