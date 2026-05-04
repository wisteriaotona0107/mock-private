# 03 テスト設計・トレーサビリティ（ID採番）

## ID体系
- 要件: `FR-xxx`, `NFR-xxx`
- 設計要素: `DSN-xxx`
- テスト: `TC-xxx`
- ユーザーストーリー: `US-xxx`

## トレーサビリティマトリクス
| Requirement | Design | Test Case | 観点 |
|---|---|---|---|
| FR-001 | DSN-010 CameraView | TC-001 | プレビュー表示 |
| FR-003 | DSN-020 TemplateSelector | TC-002 | A/B/C切替 |
| FR-004 | DSN-030 QR Service | TC-003 | QR値表示 |
| FR-005 | DSN-040 Weight Service | TC-004 | 重量値表示 |
| FR-006 | DSN-041 Weight Normalizer | TC-005 | 小数1桁化 |
| FR-007 | DSN-060 Confirm Edit | TC-006 | 不明→手入力 |
| FR-008 | DSN-061 Confirm Gate | TC-007 | 保存前確認強制 |
| FR-009 | DSN-070 Log Store | TC-008 | rawJson保存 |
| NFR-002 | DSN-040 Protocol境界 | TC-009 | Mock差し替え |

## テストケース（抜粋）
- TC-001: 初期表示でカメラプレビューが表示される
- TC-002: テンプレートA/B/CでROI枠が期待位置に変化
- TC-003: 既知QR画像で `qrRawValue` が取得される
- TC-004: モック重量が `weightValue` として表示される
- TC-005: `12` → `12.0`, `12.34` → `12.3` で正規化
- TC-006: 認識不能時「不明」表示、確認画面で入力可能
- TC-007: 確認画面を通過しないと保存不可
- TC-008: 保存データに `rawJson` を含む
- TC-009: `WeightOCRService` 実装差し替えでUI変更不要

## Human Review Gate #4（テスト設計レビュー）
- レビュー観点:
  - 要件↔設計↔テストの網羅
  - 失敗系・補正系の十分性
- 承認条件:
  - 主要FR/NFRに対応TCが存在
