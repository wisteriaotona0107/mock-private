# 10 Photo Generation Prompts

## 生成方針（最重要）
このLPの画像は「バー写真風」ではなく、**夜の途中地点**を描く。  
全プロンプトに以下の基調を含める。

- cinematic
- realistic illustration / photoreal illustration
- warm amber lighting
- depth / visual flow / forward perspective
- soft shadows / shallow depth of field / atmospheric perspective
- quiet urban night / wood textures / subtle reflections
- cinematic composition / emotional negative space
- natural human positioning / quiet motion / late evening atmosphere

## 共通ネガティブプロンプト
`no neon overload, no cyberpunk, no futuristic nightclub, no luxury hotel bar, no glossy overdesign, no EDM club, no over-sexualized atmosphere, no luxury champagne hero shot, no influencer aesthetic, no noisy crowd, no exaggerated smoke, no cyber UI, no purple neon dominance, no overexposed highlights`

---

## 1) Hero用：店内全体の雰囲気
- **ファイル名**: `hero-waypoint-night-01.webp`
- **用途**: ファーストビュー背景（ブランド空気の決定）
- **アスペクト比**: 16:9（PC） / 4:5（mobile crop対応）
- **撮影距離**: ミドルワイド（店内全景がわかる距離）
- **カメラレンズ感**: 35mm, eye-level
- **構図**: 手前左下から奥右へ伸びるカウンター導線、少し先に空席、一人客の背中を小さく配置
- **光源位置**: カウンター上ペンダント照明＋奥の壁面間接照明
- **被写界深度**: 手前中景は明瞭、遠景は柔らかくボケる
- **色温度**: 2600K〜3200K（暖色）
- **人物の姿勢**: 肩の力が抜けた自然な座り姿
- **空気感**: 「夜を終える前の一息」
- **視線誘導**: 反射線とカウンターラインで奥へ流す
- **奥行き**: 3層（手前グラス / 中景席 / 奥のぼけ光）
- **ノイズ感**: 微細フィルムグレイン
- **フィルム感**: cinematic still, high-end camera mood
- **時間帯**: late evening（21:00〜23:30）
- **湿度感**: わずかな湿り気、ガラス反射は控えめ
- **日本語プロンプト**: 「静かな都市の夜にある小さなバーラウンジ。手前から奥へ伸びる木のカウンター、琥珀色の暖かい照明、少し先に空席、遠景に柔らかいぼけ光。一人客の背中が小さく入り、会話は最小限。映画スチルのような構図、実写に近い高精細イラスト、奥行きと視線の流れを重視。過剰演出やネオンを避け、夜の途中地点としての余白を表現。」
- **英語プロンプト**: "A quiet urban night bar lounge as a waypoint before going home, with a wood counter extending from foreground to background, warm amber lighting, a subtly empty seat ahead, and soft blurred lights in the distance. Include one lone guest from behind in natural posture. Cinematic composition, photoreal illustration, emotional negative space, gentle reflections, shallow depth of field, atmospheric perspective, visual flow forward, late-evening calm."
- **避ける要素**: 派手な人物演技、大人数、乾杯、高級ホテル感、過剰発光
- **LP内使用箇所**: Hero

## 2) カウンター席
- **ファイル名**: `space-counter-forward-01.webp`
- **用途**: Spaceセクション
- **アスペクト比**: 3:2
- **撮影距離**: ミドル
- **カメラレンズ感**: 50mm
- **構図**: カウンターの奥行きを主役、肘置きと空席を含む
- **光源位置**: 上部暖色照明、奥に弱い補助光
- **被写界深度**: 手前木目シャープ、奥はぼかす
- **色温度**: 2800K
- **人物の姿勢**: 画角端に自然な腕や背中のみ
- **空気感**: 急がない停泊
- **視線誘導**: カウンター稜線
- **奥行き**: 一本道構図
- **ノイズ感**: 微粒子
- **フィルム感**: magazine editorial still
- **時間帯**: 20:30〜22:30
- **湿度感**: 乾きすぎない室内空気
- **日本語プロンプト**: 「奥へ続く木製カウンター席。照明は暖かく、手前の木目とグラス縁は明瞭、奥は柔らかくぼける。席の間隔に余白があり、急がない時間を感じる。映画スチルのような実写寄りイラスト。」
- **英語プロンプト**: "A forward-flowing bar counter interior with warm amber lamps, clear wood grain in foreground, soft blur in the distance, and calm spacing between seats. Photoreal editorial illustration with cinematic depth and quiet mood."
- **避ける要素**: ネオン、未来感、豪華すぎる装飾
- **LP内使用箇所**: Space

## 3) グラスと酒瓶
- **ファイル名**: `detail-glass-bottle-amber-01.webp`
- **用途**: Drinksセクション
- **アスペクト比**: 4:3
- **撮影距離**: クローズアップ
- **カメラレンズ感**: 85mm macro feel
- **構図**: 手前グラス、奥棚ボトルぼけ
- **光源位置**: 斜め後方の暖色光
- **被写界深度**: 浅め
- **色温度**: 3000K
- **人物の姿勢**: 手元のみ（顔なし）
- **空気感**: 静かな作業
- **視線誘導**: 液面反射から奥棚へ
- **奥行き**: 前中後3層
- **ノイズ感**: 微少
- **フィルム感**: high-end still life
- **時間帯**: late evening
- **湿度感**: 低め
- **日本語/英語プロンプト**: 上記条件を満たす高精細実写寄り表現を指定
- **避ける要素**: ラベル誇示、シャンパン誇張
- **LP内使用箇所**: Drinks

## 4) 一人客が静かに過ごす様子
- **ファイル名**: `scene-solo-quiet-forward-01.webp`
- **用途**: How to spend（一人）
- **アスペクト比**: 3:2
- **必須**: 背中主体、視線は奥、静かな所作
- **プロンプト要件**: 「無理をしない前進」「明日へ戻る途中」を空気で表現
- **避ける要素**: 表情の演技、ドラマ過多
- **LP内使用箇所**: Experience

## 5) 二人で会話する様子
- **ファイル名**: `scene-two-whisper-night-01.webp`
- **用途**: How to spend（二人）
- **アスペクト比**: 3:2
- **必須**: 小声の会話、適切な距離、周囲の余白
- **LP内使用箇所**: Experience

## 6) 小皿料理
- **ファイル名**: `food-smallplates-seasonal-01.webp`
- **用途**: Foodsセクション
- **アスペクト比**: 4:3
- **必須**: 食べ進める途中感、盛りすぎない
- **LP内使用箇所**: Foods

## 7) 入口外観
- **ファイル名**: `exterior-entrance-warm-door-01.webp`
- **用途**: Access導線
- **アスペクト比**: 3:2
- **必須**: 扉の先に暖色、街の夜気配、入りやすさ
- **LP内使用箇所**: Access

## 8) 季節のおすすめ
- **ファイル名**: `seasonal-recommendation-quiet-01.webp`
- **用途**: Seasonal
- **アスペクト比**: 1:1
- **必須**: 季節感は控えめ、主張しすぎない
- **LP内使用箇所**: Menu/Seasonal

## 9) メニュー差し替え用汎用画像
- **ファイル名**: `menu-generic-update-01.webp`
- **用途**: 更新時の共通差し替え
- **アスペクト比**: 4:3
- **必須**: 汎用性、余白多め
- **LP内使用箇所**: Menu

## 10) SNS / OGP用画像
- **ファイル名**: `ogp-night-waypoint-01.webp`
- **用途**: OGP
- **アスペクト比**: 1.91:1
- **必須**: 文字載せ可能なネガティブスペース
- **LP内使用箇所**: OGP

## 制作チェック
- Heroとして成立するか
- 雑誌巻頭 / 映画スチル水準か
- 視線が前へ流れる構図か
- “夜の途中地点”が伝わるか
