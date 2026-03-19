# Test Strategy

## Purpose
この文書は、業務タブレットUIを受け入れ可能な品質へ近づけるためのテスト観点を整理する。

## Core scenarios
- 作業開始から完了確認までが迷わず進められる
- 片手操作でも主要アクションが押しやすい
- 現在地と対象が常に把握できる
- 保存中、保存完了、保存失敗が見分けられる
- 危険操作が誤って実行されにくい

## Mandatory state coverage
- loading
- empty
- error
- success
- disabled
- network degraded
- confirm required

## Device coverage
- Tablet portrait
- Tablet landscape
- Narrow mobile fallback
- Wide desktop preview

## Review checkpoints
- 情報量過多になっていないか
- 長いラベルや多件数でも破綻しないか
- スクロール依存が強すぎないか
- 重要操作と危険操作の距離が確保されているか
