# 日本酒棚卸（iOS 18.6+ / オフライン）

SwiftUI + SwiftData で作成した、ローカル保存専用の日本酒在庫管理アプリです。

## 機能
- 在庫一覧（検索 / 開栓フィルタ / 保管場所フィルタ / 並び替え）
- 在庫詳細（入庫・提供・棚卸調整）
- 増減履歴（StockEvent）
- 銘柄管理（Sake の作成・編集・削除）
  - 同名チェック（重複禁止）
  - 在庫が紐づく銘柄は削除不可
- 在庫追加フォーム（銘柄選択、容量、場所、開栓状態、残量）

## ディレクトリ構成
- `NihonshuInventory/Models`: SwiftDataモデル
- `NihonshuInventory/Services`: 在庫更新ロジックとバリデーション
- `NihonshuInventory/Views`: 画面
- `NihonshuInventory/Utilities`: フォーマッタ
- `NihonshuInventoryTests`: ユニットテスト

## Xcodeで実行する手順
1. Xcode 16 以降で iOS App プロジェクト `NihonshuInventory` を新規作成（SwiftUI / SwiftData）。
2. Deployment Target を **iOS 18.6** に設定。
3. このリポジトリの `NihonshuInventory/` 配下ファイルをプロジェクトに追加。
4. テストターゲットへ `NihonshuInventoryTests/InventoryServiceTests.swift` を追加。
5. 実機または iOS 18.6+ シミュレータで Run。

> 注: このリポジトリには `.xcodeproj` は含めていません。既存プロジェクトへ取り込みやすいよう、ファイル分割したソースのみを配置しています。
