# Data Schema

## Purpose
この文書は、業務タブレットUIで必要なデータ構造と状態フィールドの基準を定義する。

## Screen-level state template
```json
{
  "screenId": "example-screen",
  "currentSection": "list",
  "selectedItemId": null,
  "isLoading": false,
  "isSaving": false,
  "hasError": false,
  "errorCode": null,
  "successMessage": null,
  "networkStatus": "online"
}
```

## Item-level state template
```json
{
  "id": "item-001",
  "label": "サンプル項目",
  "status": "default",
  "isSelected": false,
  "isDisabled": false,
  "isDirty": false,
  "lastUpdatedAt": null
}
```

## Required considerations
- current / selected / active を分離する
- 保存前変更の有無を判定できるようにする
- error は原因特定しやすいコードまたは種別を持たせる
- 危険操作には confirmRequested などの確認状態を検討する
- ネットワーク不調時の表示状態を持たせる
