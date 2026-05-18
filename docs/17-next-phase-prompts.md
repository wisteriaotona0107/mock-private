# 17 Next Phase Prompts

## 1. LP実装用プロンプト
「`docs/00`〜`docs/16` を読み込み、`otona.to.w` のLPを実装してください。中心解釈は『大人たちが少し前へ戻るための途中地点』。forwardは自己啓発ではなく“整えるための前進”として扱うこと。スクロール体験は“夜が進む”設計（暗→やや暖→深夜の余白）。Hero/Concept/Experience/Menu/Access/FAQ/CTAを実装し、メニューは `data/menu.json` の手動更新前提。禁止: 露骨アダルト、成功哲学、過度高級、ネオン過多。」

## 2. 画像生成用プロンプト
「`docs/10-photo-generation-prompts.md` に従い、全画像を photoreal illustration で生成。必須: warm amber lighting, depth, forward perspective, emotional negative space。各画像で撮影距離・レンズ感・構図・光源・DOF・色温度・人物姿勢・湿度感・ネガティブプロンプトを明示。禁止: cyberpunk, futuristic nightclub, influencer aesthetic。」

## 3. コピー修正用プロンプト
「`docs/08-copywriting-patterns.md` の語彙ガードを守り、全コピーを“急がない前進”に寄せて再調整。『勝つ・挑戦・上へ』系語彙を除去し、『戻る・整える・続ける・途中』語彙を優先。セクションごとにA/B案を提出。」

## 4. メニューJSON作成用プロンプト
「`docs/11-menu-update-structure.md` を参照し、`seasonal_recommendations` を含む実運用JSONを作成。`available=true` の表示ルール、画像パス規約、価格表記統一、更新日フィールドを追加。運用者が手編集しやすいコメント付きREADMEも同時作成。」

## 5. Figmaデザイン用プロンプト
「Figmaで1ページLPを作成。12カラム（PC）/1カラム（mobile）。奥行きと視線流れを最優先し、Heroは『奥へ伸びるカウンター＋少し先の空席＋一人客の背中』を核にする。色は琥珀・深茶・黒・くすみ金。UIは控えめ、余白広め。CTAは3箇所。」

## 6. レビュー結果反映用プロンプト
「`docs/16-review-checklist.md` の未達項目のみを対象に差分修正。ブランド中心解釈（途中地点/中継地点）から外れた表現を優先的に修正。修正後は“何を・なぜ・どの判断軸で”変えたかを箇条書きで報告。」

## 未決定事項（人間確認）
- 店舗名として `otona.to.w` をそのまま使うか
- 読み方（オトナ・トゥ・ダブリュー等）を公開するか
- 酒の主軸（wine / whisky / cocktail）
- フード訴求の強度（小皿中心 or しっかり食事）
- 予約必須か、ふらっと入店可か
- 実店舗想定か、架空ブランド/ポートフォリオか
- 画像トーン（実写寄り / イラスト寄り）
- LP単体か、複数ページ同時着手か
- SNS運用頻度と更新責任者
