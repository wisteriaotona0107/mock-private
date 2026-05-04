# 01 基本設計（Architecture / Component Design）

## コンポーネント構成
- `CameraView`
- `ScanOverlayView`
- `LayoutTemplateSelector`
- `QRScannerService`
- `WeightOCRService`（Protocol）
- `SevenSegmentAnalyzerMock`（WeightOCRService準拠）
- `ScanResultViewModel`
- `ScanResultConfirmView`
- `ScanLogStore`

## 設計方針
1. `CameraFrame` を中心に処理を分離
2. ROIは `LayoutTemplate` から算出
3. `QRScannerService` と `WeightOCRService` は独立実行
4. `ScanResultViewModel` で結果統合
5. 確認画面で人手補正後に保存

## データモデル
`ScanResult`
- id
- scannedAt
- layoutTemplate
- qrRawValue
- productId
- productName
- weightValue
- weightUnit
- weightConfidence
- qrConfidence
- status
- rawJson

## インターフェース定義（要旨）
```swift
protocol WeightOCRService {
    func recognizeWeight(from frame: CameraFrame, roi: CGRect) async -> WeightRecognitionResult
}
```

## エラーハンドリング方針
- QR不検出: `qrRawValue = "不明"`
- 重量不検出: `weightValue = nil`, UIで「不明」
- いずれか失敗でも確認画面へ遷移可能（手入力補正で救済）

## Human Review Gate #2（基本設計レビュー）
- レビュー観点:
  - 責務分離（View/Service/ViewModel）
  - 差し替え可能性（Protocol境界）
  - エラー時UX
- 承認条件:
  - コンポーネント責務が重複していない
  - 将来OCR差し替えに追加改修が限定的
