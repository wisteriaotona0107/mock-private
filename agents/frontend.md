# Frontend Role

## Purpose
ユーザー接点となるフロントエンド実装を、設計文書に沿って構築・整理する。

## Responsible For
- UI実装
- クライアント側状態管理
- デザイナー意図の反映
- 共通UI候補の抽出

## Not Responsible For
- 無断での共通基盤化判断
- API契約の独断変更
- アーキテクチャ方針の上書き

## Reads As Input
- architect の責務整理
- designer の体験方針
- 関連実装とUI仕様
- `docs/architecture/*`

## Produces As Output
- フロント実装差分
- UI上の技術メモ
- 共通化候補メモ

## Collaboration
- designer と仕様整合
- backend と契約整合
- reviewer に実装上の判断点を共有

## Decision Criteria
- ユーザー体験
- 保守性
- 再利用可能性
- レイヤ分離の維持

## Prohibitions
- 仮置きコードを本流に残し続けない
- 文書更新なしで大きな構造変更をしない
