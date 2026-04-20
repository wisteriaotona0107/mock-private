# Industrial Product Visual Mock Prompts

以下は、指定要件に合わせた **3Dレンダ風プロダクトビジュアル生成用プロンプト**です。

## 共通スタイル要件
- industrial design
- minimal + cyberpunk subtle
- material contrast（metal + rubber）
- brushed stainless steel
- matte black elastomer
- precision machined edges
- close-up product shot
- side grip clearly visible
- hand holding referenceあり
- high contrast
- studio lighting
- soft shadow
- 使用シーン（手持ち）
- 分解構造ビジュアル

---

## Variant A（Hero Close-up）

### Prompt
Create a photorealistic 3D-render style close-up product shot of a compact handheld device with an industrial design language, minimal form with subtle cyberpunk accents. Emphasize material contrast between brushed stainless steel body panels and matte black elastomer side grip. Precision-machined chamfered edges must be clearly visible. Show a human hand holding the device from the side so the grip geometry and ergonomics are obvious. Use high-contrast studio lighting with clean highlights, deep but soft shadows, dark neutral background, premium commercial product photography composition, ultra-detailed textures, realistic reflections, shallow depth of field, 8k quality.

### Negative Prompt
cartoon, low-poly, flat shading, over-saturated neon, cluttered background, text overlay, watermark, deformed hand, extra fingers, plastic-looking metal, noisy render, motion blur, low resolution.

---

## Variant B（Usage Scene / Handheld Context）

### Prompt
Generate a realistic 3D product render showing a person naturally holding the device in one hand during use. The device follows industrial minimal aesthetics with subtle cyberpunk detailing lines only around seams. Side grip is the focal point: matte black elastomer with tactile microtexture, surrounded by brushed stainless steel frame with precision-machined edges. Camera angle is close-up three-quarter side view to reveal thumb placement and grip comfort. Lighting is high-contrast studio setup with directional key light and soft fill, soft shadow falloff, controlled specular highlights, cinematic yet clean commercial look.

### Negative Prompt
busy environment, outdoor sunlight, extreme lens distortion, toy-like appearance, glossy rubber, rusty metal, exaggerated cyberpunk LEDs, bad anatomy, duplicated hands, blurry details, artifacts.

---

## Variant C（Exploded Structure Visual）

### Prompt
Create an exploded-view style 3D render of the same handheld product, maintaining industrial minimal design and subtle cyberpunk cues. Separate components along one axis: brushed stainless steel outer shell, matte black elastomer side grip module, internal frame, and fastening elements. Keep precision-machined edges crisp and realistic. Include a secondary inset showing a hand-held reference scale of the assembled unit. Use high-contrast studio lighting on a dark gradient background, soft shadows, clean technical presentation mixed with premium product-ad style.

### Negative Prompt
engineering blueprint lines only, low-detail internals, transparent ghost model, chaotic part layout, random labels, text-heavy infographic, flat lighting, unrealistic materials, jagged edges, low-res.

---

## 追加オプション（任意）

### Aspect Ratio
- 1:1（SNS向け）
- 4:5（縦構図）
- 16:9（プレゼン向け）

### 推奨生成パラメータ例
- Steps: 30-50
- CFG: 6-8
- Sampler: DPM++ 2M Karras 相当
- Seed: 固定してA/B/C比較

