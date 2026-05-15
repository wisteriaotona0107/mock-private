# asset-prompt-plan.md

## 目的
後工程で画像生成（例：GPT画像生成）を実行する際の、素材要件とプロンプト方針を定義する。
※このフェーズでは画像生成は行わない。

## 必要素材リスト
1. Hero用：パックご飯と缶詰・味噌汁・調味料が並ぶ温かい備蓄棚
2. パターンカード用：丼、卵、缶詰、ふりかけ、冷凍食品、汁物の6系統
3. 賞味期限タイムライン用：食品ストックが期間別に並ぶ図解
4. 味変レイヤー用：調味料小瓶と薬味の俯瞰図
5. シーン別カード用：超省エネ / 疲労回復寄り / 防災寄りの3構成

## 共通プロンプト方針
- 写実寄り、生活感、実在する台所/食卓に近い空気感。
- 過剰な演出（災害シーン、極端なドラマ照明）は避ける。
- 食器・包装は日本の一般家庭になじむスタイル。
- 可読性確保のため、文字入れは最小限または無し。

## 素材別プロンプト雛形

### Hero
- キーワード：warm pantry shelf, packaged rice, canned fish, miso soup, condiments, natural light, tidy but lived-in
- 禁止要素：サバイバル演出、軍用品風、過度なCG質感

### 6パターンカード
- キーワード：top-down meal variations with packaged rice base, six distinct categories, consistent tableware
- 禁止要素：実在しない食材、不自然な手指、過密構図

### 賞味期限タイムライン
- キーワード：clean infographic style, duration bands, food category icons, neutral background
- 禁止要素：細かすぎる文字、低コントラスト

### 味変レイヤー
- キーワード：condiment mini bowls, aroma/spicy/texture/sour layers, overhead composition
- 禁止要素：色飽和、情報過多

## 品質チェック観点
- 料理が美味しそうに見えるか
- 情報UI上に重ねても視認性が落ちないか
- 「防災専用感」ではなく「日常延長感」があるか
