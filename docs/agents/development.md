# Development Guide

## 実装ポリシー
- セマンティックHTMLを使う。
- CSSはコンポーネント単位で整理する。
- JavaScriptはマイクロインタラクションに限定し、過剰な依存を増やさない。

## 実装チェック
- フォントは `Inter` と `Noto Sans JP` のフォールバックを含める。
- すべての主要カードに `border-radius` とソフトシャドウを適用する。
- Hover / Focus / Active 状態を明示する。
