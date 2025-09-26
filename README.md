# Quick Colorize

Quick Colorize is a Next.js 14 demo app that colorizes grayscale photos in under 10 seconds using cloud inference providers (Replicate or HuggingFace) with a mock provider for local development. The app enforces strict privacy, temporary storage, caching by image hash, and optional watermarks/labels.

## Features
- Drag & drop / camera capture uploads with EXIF stripping and max dimensions enforced
- Colorize workflow with compare slider, watermark and label toggles
- Result viewer with signed download URLs and pro-request CTA
- Redis cache by image hash and processing options
- Pluggable inference providers (Replicate, HuggingFace, mock)
- Prisma + Postgres schema with audit tables
- Temporary object storage via S3-compatible bucket
- Upstash Redis rate/caching, Upstash/Neon ready
- Jest unit tests, Playwright E2E (with mocked network), Lighthouse CI

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm or npm
- Postgres database (Neon recommended)
- S3-compatible bucket (R2, S3, etc.)
- Upstash Redis (or compatible)
- Replicate and/or HuggingFace API tokens (or use mock provider locally)

### Installation
```bash
npm install
npm run prisma:generate
```

### Environment
Create `.env.local` (Vercel) or `.env` with:
```
NEXT_PUBLIC_SITE_NAME=Quick Colorize
NODE_ENV=development
S3_ENDPOINT=https://<r2-endpoint>
S3_BUCKET=quick-colorize
S3_REGION=auto
S3_ACCESS_KEY_ID=...
S3_SECRET_ACCESS_KEY=...
S3_PUBLIC_BASE_URL=https://static.example.com
DOWNLOAD_URL_TTL_MIN=15
REDIS_URL=...
REDIS_TOKEN=...
DATABASE_URL=postgres://...
REPLICATE_API_TOKEN=...
REPLICATE_MODEL_REF=stability-ai/opencv-colorization
HF_TOKEN=...
HF_MODEL=org/deoldify-lite
ADMIN_TOKEN=change-me
DEFAULT_PROVIDER=replicate
IMAGE_TTL_HOURS=24
MAX_IMAGE_LONG_SIDE=2000
MAX_IMAGE_SIZE_BYTES=8388608
COST_PER_RUN_YEN=12
DEV_MOCK_PROVIDER=1
```
Set `DEV_MOCK_PROVIDER=1` for local testing to use the stub provider.

### Database
Run migrations:
```bash
npm run prisma:migrate -- --name init
```
Seed samples (optional):
```bash
node scripts/seed.ts
```

### Development
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000).

### Testing
```bash
npm run test       # Jest unit tests
npm run test:e2e   # Playwright (uses mock network intercepts)
npm run lighthouse # Lighthouse CI
```

### Deployment
- Deploy Next.js app to Vercel (set `NODE_OPTIONS=--max_old_space_size=4096` if needed)
- Provision S3-compatible bucket with lifecycle rule deleting objects after 24h
- Configure Redis (Upstash) and Postgres (Neon/Supabase)
- Set environment variables in Vercel dashboard
- Schedule daily job to purge expired DB rows if desired

## Security & Privacy
- All uploads stripped of EXIF metadata on ingest
- Signed download URLs (default 15 min)
- Cookies are HttpOnly + SameSite=Lax
- Strict CSP via `next-secure-headers`
- Basic rate limiting via Upstash Redis (extend as needed)

## CI/CD
GitHub Actions workflow is expected to run:
- `npm run test`
- `npm run test:e2e`
- `npm run lighthouse`

## Mock Provider
For development or CI without external calls, set `DEV_MOCK_PROVIDER=1`. The mock returns a static color image in ~500ms.
