import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSignedUrl, putObject, extractKeyFromUrl } from '@/lib/storage';
import { cacheGet, cacheSet } from '@/lib/cache';
import { applyWatermark } from '@/lib/image';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  if (request.headers.get('X-Requested-With') !== 'quick-colorize') {
    return NextResponse.json({ message: 'invalid request' }, { status: 403 });
  }
  const result = await prisma.result.findUnique({ where: { id: params.id }, include: { image: { include: { jobs: { orderBy: { created_at: 'desc' }, take: 1 } } } } });
  if (!result) return NextResponse.json({ message: 'not found' }, { status: 404 });
  const { searchParams } = new URL(request.url);
  const format = searchParams.get('format') === 'jpeg' ? 'jpeg' : (result.format as 'png' | 'jpeg');
  const watermark = searchParams.get('watermark') !== 'off';
  const cacheKey = `${result.image.sha256}:download:${format}:${watermark}`;
  const cached = await cacheGet<{ key: string }>(cacheKey);
  if (cached) {
    const signedCached = await getSignedUrl(cached.key);
    return NextResponse.json({
      url: signedCached,
      cached: true,
      sha256: result.image.sha256,
      modelName: result.image.jobs[0]?.model_name ?? 'opencv-colorization',
      durationMs: result.image.jobs[0]?.duration ?? 0,
      imageId: result.image.id
    });
  }
  const baseKey = extractKeyFromUrl(result.result_url);
  const baseSigned = await getSignedUrl(baseKey);
  const response = await fetch(baseSigned);
  if (!response.ok) {
    return NextResponse.json({ message: 'failed to fetch base image' }, { status: 500 });
  }
  const baseBuffer = Buffer.from(await response.arrayBuffer());
  const variantBuffer = await applyWatermark(baseBuffer, { watermark, simpleLabel: result.simple_label, format });
  const variantUpload = await putObject(variantBuffer, `image/${format}`, Number(process.env.IMAGE_TTL_HOURS ?? 24));
  const ttl = Number(process.env.DOWNLOAD_URL_TTL_MIN ?? 15) * 60;
  await cacheSet(cacheKey, { key: variantUpload.key }, ttl);
  const signed = await getSignedUrl(variantUpload.key);
  return NextResponse.json({
    url: signed,
    cached: false,
    sha256: result.image.sha256,
    modelName: result.image.jobs[0]?.model_name ?? 'opencv-colorization',
    durationMs: result.image.jobs[0]?.duration ?? 0,
    imageId: result.image.id
  });
}
