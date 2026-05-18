# 14 Implementation Notes

比較: 静的HTML(最速) / React+Vite(柔軟) / Next.js(拡張強) / Astro(コンテンツ向き)。

推奨: **Astro + TypeScript + 軽量コンポーネント**（初期LPで高速・将来拡張しやすい）。
- ディレクトリ案: `src/components`, `src/content`, `public/images`, `data/menu.json`
- 画像管理: `public/images` 固定パス
- メニュー更新: `data/menu.json`
- SEO/OGP: title, description, og:image, JSON-LD
- レスポンシブ: 360px〜
- A11y: コントラスト, alt, キーボード操作
- 将来拡張: 予約API, CMS, 多店舗ルーティング
