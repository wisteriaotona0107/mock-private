# 頭皮ケア情報サイト MVP

本リポジトリは Next.js + NestJS + PostgreSQL + Prisma を用いた頭皮ケア情報サイトMVPのモノレポ構成です。

## 迅速起動

```bash
pnpm install
cp .env.example .env
pnpm -r prisma generate
docker compose up -d
pnpm -r dev
```

## テスト

```bash
pnpm test -r
```

## フォルダ構成
- apps/web: Next.js 14 App Router UI
- apps/api: NestJS 10 API (Fastify)
- packages/shared: DTO/ロジック共有パッケージ
- infrastructure: Docker,マイグレーション,バックアップスクリプト

## 環境変数
`.env.example` を参照。開発・本番ともに Asia/Tokyo をデフォルトタイムゾーンとします。

## 本番運用

1. `docker compose -f docker-compose.yml up -d --build`
2. `pnpm -r prisma migrate deploy`
3. `pnpm -r build`
4. `pnpm -r start`

### バックアップ

PostgreSQL の日次バックアップスクリプトは `infrastructure/backup/backup.sh` を参照してください。

