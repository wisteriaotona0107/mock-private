import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cacheGet, cacheSet } from '@/lib/cache';
import { getProvider, resolveProvider } from '@/lib/inference/provider';
import { applyWatermark } from '@/lib/image';
import { putObject, getSignedUrl } from '@/lib/storage';
import { rateLimit } from '@/lib/rate-limit';
import { logMetric } from '@/lib/metrics';

const IMAGE_TTL_HOURS = Number(process.env.IMAGE_TTL_HOURS ?? 24);

export async function POST(request: Request) {
  const started = Date.now();
  let statusCode = 200;
  try {
    if (request.headers.get('X-Requested-With') !== 'quick-colorize') {
      return NextResponse.json({ message: 'invalid request' }, { status: 403 });
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('cf-connecting-ip') ?? 'anonymous';
    const limited = await rateLimit(`colorize:${ip}`, 30, 600);
    if (!limited.allowed) {
      statusCode = 429;
      return NextResponse.json({ message: '操作が多すぎます。少し待って再度お試しください。' }, { status: 429 });
    }
    const body = await request.json();
    const { imageId, options } = body;
    const watermark = options?.watermark !== false;
    const simpleLabel = options?.simpleLabel ?? false;
    const format = options?.format === 'jpeg' ? 'jpeg' : 'png';
    const image = await prisma.image.findUnique({ where: { id: imageId }, include: { result: true } });
    if (!image) return NextResponse.json({ message: 'image not found' }, { status: 404 });
    const modelName = process.env.DEFAULT_MODEL_NAME ?? 'opencv-colorization';
    const cacheKey = `${image.sha256}:${modelName}:${watermark}:${simpleLabel}:${format}`;
    const cached = await cacheGet<{ key: string }>(cacheKey);
    if (cached) {
      logMetric({ route: '/api/colorize', durationMs: Date.now() - started, status: 200, cacheHit: true });
      statusCode = 200;
      const signed = await getSignedUrl(cached.key);
      return NextResponse.json({ resultId: image.result?.id ?? 'cached', url: signed, durationMs: 0, cached: true });
    }
    const providerName = resolveProvider();
    const provider = await getProvider(providerName);
    const job = await prisma.job.create({
      data: {
        imageId: image.id,
        model_name: modelName,
        status: 'running'
      }
    });
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    let resultUrl: string;
    try {
      const result = await provider.colorize(image.storage_url, { longSideMax: Number(process.env.MAX_IMAGE_LONG_SIDE ?? 2000) });
      resultUrl = result.resultUrl;
    } finally {
      clearTimeout(timeout);
    }
    const response = await fetch(resultUrl);
    if (!response.ok) throw new Error('failed to fetch provider result');
    const baseBuffer = Buffer.from(await response.arrayBuffer());
    let baseUrl = image.result?.result_url;
    if (!baseUrl) {
      const baseUpload = await putObject(baseBuffer, `image/${format}`, IMAGE_TTL_HOURS);
      baseUrl = baseUpload.url;
    }
    const variantBuffer = await applyWatermark(baseBuffer, { watermark, simpleLabel, format });
    const variantUpload = await putObject(variantBuffer, `image/${format}`, IMAGE_TTL_HOURS);
    const result = await prisma.result.upsert({
      where: { imageId: image.id },
      update: {
        result_url: baseUrl,
        format,
        watermark,
        simple_label: simpleLabel
      },
      create: {
        imageId: image.id,
        result_url: baseUrl,
        format,
        watermark,
        simple_label: simpleLabel
      }
    });
    await prisma.job.update({
      where: { id: job.id },
      data: {
        status: 'succeeded',
        duration: Date.now() - started,
        cost_yen: Number(process.env.COST_PER_RUN_YEN ?? 5),
        completed_at: new Date()
      }
    });
    await cacheSet(cacheKey, { key: variantUpload.key }, IMAGE_TTL_HOURS * 3600);
    logMetric({
      route: '/api/colorize',
      durationMs: Date.now() - started,
      status: 200,
      cacheHit: false,
      provider: providerName,
      costYen: Number(process.env.COST_PER_RUN_YEN ?? 5)
    });
    statusCode = 200;
    const signedUrl = await getSignedUrl(variantUpload.key);
    return NextResponse.json({ resultId: result.id, url: signedUrl, durationMs: Date.now() - started, cached: false });
  } catch (error: any) {
    if (error.name === 'AbortError') {
      statusCode = 504;
    } else if (String(error.message || '').toLowerCase().includes('timeout')) {
      statusCode = 504;
    } else {
      statusCode = 500;
    }
    logMetric({ route: '/api/colorize', durationMs: Date.now() - started, status: statusCode, cacheHit: false });
    return NextResponse.json({ message: error.message ?? 'colorize failed' }, { status: statusCode });
  }
}
