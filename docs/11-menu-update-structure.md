# 11 Menu Update Structure
- 更新対象: ドリンク、フード、季節おすすめ、売切れ状態
- 更新頻度: 週次〜月次
- 前提: 店舗運用者の手動更新
- 管理形式候補: JSON（表示連携向き）/ Markdown（編集容易）/ CSV（表計算連携）
- 初期実装: JSON + 簡易バリデーション
- 将来: Headless CMS移行余地
- 画像差替: `/images/menu/*.jpg` 命名規則
- 表示ルール: `available=true` のみ表示、季節枠最大3件

```json
{
  "seasonal_recommendations": [
    {
      "id": "rec_001",
      "title": "季節の一杯",
      "category": "drink",
      "description": "夜のはじまりに合う、香りの穏やかな一杯。",
      "price": "900",
      "image": "/images/menu/seasonal-001.jpg",
      "available": true
    }
  ]
}
```
