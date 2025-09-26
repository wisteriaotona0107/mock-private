import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sha256 } from '@/lib/hash';
import { prepareUpload } from '@/lib/image';
import { putObject, getSignedUrl, extractKeyFromUrl } from '@/lib/storage';
import { ensureSession } from '@/lib/auth';
import { rateLimit } from '@/lib/rate-limit';
import { logMetric } from '@/lib/metrics';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png'];
const MAX_SIZE = Number(process.env.MAX_IMAGE_SIZE_BYTES ?? 8 * 1024 * 1024);
const TTL_HOURS = Number(process.env.IMAGE_TTL_HOURS ?? 24);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageId = searchParams.get('imageId');
  if (!imageId) {
    return NextResponse.json({ message: 'imageId required' }, { status: 400 });
  }
  const image = await prisma.image.findUnique({ where: { id: imageId } });
  if (!image) return NextResponse.json({ message: 'not found' }, { status: 404 });
  const previewUrl = await getSignedUrl(extractKeyFromUrl(image.storage_url));
  return NextResponse.json({
    imageId: image.id,
    previewUrl,
    width: image.width,
    height: image.height,
    sha256: image.sha256
  });
}

export async function POST(request: Request) {
  const start = Date.now();
  let statusCode = 200;
  try {
    if (request.headers.get('X-Requested-With') !== 'quick-colorize') {
      statusCode = 403;
      return NextResponse.json({ message: 'invalid request' }, { status: 403 });
    }
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('cf-connecting-ip') ?? 'anonymous';
    const limit = await rateLimit(`upload:${ip}`, 30, 600);
    if (!limit.allowed) {
      statusCode = 429;
      return NextResponse.json({ message: '操作が多すぎます。少し待って再度お試しください。' }, { status: 429 });
    }
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file || !(file instanceof File)) {
      statusCode = 400;
      return NextResponse.json({ message: 'ファイルが必要です' }, { status: 400 });
    }
    if (!ACCEPTED_TYPES.includes(file.type)) {
      statusCode = 415;
      return NextResponse.json({ message: 'JPEG/PNGのみ対応しています' }, { status: 415 });
    }
    const arrayBuffer = await file.arrayBuffer();
    if (arrayBuffer.byteLength > MAX_SIZE) {
      statusCode = 413;
      return NextResponse.json({ message: 'ファイルサイズが大きすぎます' }, { status: 413 });
    }
    const buffer = Buffer.from(arrayBuffer);
    const prepared = await prepareUpload(buffer);
    const hash = await sha256(prepared.buffer);
    const existing = await prisma.image.findUnique({ where: { sha256: hash } });
    if (existing) {
      statusCode = 200;
      const previewUrl = await getSignedUrl(extractKeyFromUrl(existing.storage_url));
      return NextResponse.json(
        {
          imageId: existing.id,
          sha256: existing.sha256,
          width: existing.width,
          height: existing.height,
          previewUrl
        },
        { status: 200 }
      );
    }
    const upload = await putObject(prepared.buffer, `image/${prepared.format}`, TTL_HOURS);
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? request.headers.get('cf-connecting-ip');
    ensureSession(ip ?? undefined);
    const expiresAt = new Date(Date.now() + TTL_HOURS * 3600 * 1000);
    const image = await prisma.image.create({
      data: {
        orig_filename: file.name,
        content_type: file.type,
        width: prepared.width,
        height: prepared.height,
        size_bytes: arrayBuffer.byteLength,
        sha256: hash,
        storage_url: upload.url,
        expires_at: expiresAt
      }
    });
    statusCode = 200;
    const previewUrl = await getSignedUrl(extractKeyFromUrl(image.storage_url));
    return NextResponse.json({
      imageId: image.id,
      sha256: image.sha256,
      width: image.width,
      height: image.height,
      previewUrl
    });
  } catch (error: any) {
    statusCode = 500;
    return NextResponse.json({ message: error.message ?? 'upload failed' }, { status: 500 });
  } finally {
    logMetric({ route: '/api/uploads', durationMs: Date.now() - start, status: statusCode });
  }
}

