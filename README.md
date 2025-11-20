# Xserver 向け PHP JSON 管理UI サンプル

Xserver (PHP) 上で JSON + 画像を管理するための最小構成。`public_html` をそのままアップロードするだけで動作します。

## 構成
- `public_html/index.html` : 管理UIへの入口。
- `public_html/admin/index.php` : 管理画面 (vanilla JS)。
- `public_html/api/*.php` : load/save/upload API。CSRF トークンを発行し、同一オリジンのみ許可。
- `public_html/data/*.json` : 編集対象の JSON。書き込みには `644` / `604` を想定。
- `public_html/images/` : 画像アップロード先 (705/755 推奨)。
- `public_html/.htaccess` : ディレクトリリスティング禁止・文字化け防止・CORS/セッション強化。

## 使い方
1. `public_html` 以下を Xserver の同階層へ配置。
2. `admin/` を開き、データセット (sake / menu) を選択。
3. 画像を選択して送信すると `sake001.jpg` 形式で自動採番され、JSON に反映されます。
4. 並び替えは `▲/▼` を押して保存するだけ。

詳細な設計・テストケースは `public_html/admin/DESIGN.md` を参照してください。
