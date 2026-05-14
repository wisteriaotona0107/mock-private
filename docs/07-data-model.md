# 07 Data Model

データ駆動で客・髪型・道具・イベントを拡張可能にする。

## 主要エンティティ
- Hairstyle
- Customer
- Tool
- BuffCard
- PolicyCard
- Debuff
- InfluencerEvent
- TurnResult
- RunResult

## JSON草案
```json
{
  "hairstyleId": "mohawk_red_rare",
  "name": "赤色モヒカン",
  "rarity": "rare",
  "hairVolume": 70,
  "density": 55,
  "attachment": 65,
  "culturalValue": 60,
  "influence": 45,
  "buzzRisk": 30,
  "baldSuitability": 80,
  "baseReward": 120
}
```

```json
{
  "toolId": "hyper_clipper",
  "name": "超回転バリカン",
  "type": "clipper",
  "effect": {
    "cutPower": 25,
    "heatRisk": 10,
    "jamResistance": -5
  },
  "description": "処理速度は上がるが、毛詰まりと熱暴走に注意。"
}
```

```json
{
  "influencerId": "longhair_streamer",
  "name": "超ロング配信者",
  "eventType": "bonus_customer",
  "difficultyModifier": 1.4,
  "rewardModifier": 2.5,
  "worldInfluence": 8,
  "risk": "炎上コメントが増え、一定時間操作UIが揺れる。"
}
```
