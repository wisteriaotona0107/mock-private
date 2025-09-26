import sharp from 'sharp';

const MAX_LONG_SIDE = Number(process.env.MAX_IMAGE_LONG_SIDE ?? 2000);

export async function prepareUpload(buffer: Buffer) {
  const image = sharp(buffer, { failOn: 'none' }).rotate();
  const metadata = await image.metadata();
  const longSide = Math.max(metadata.width ?? 0, metadata.height ?? 0);
  const resized = longSide > MAX_LONG_SIDE ? image.resize({ width: metadata.width && metadata.height && metadata.width > metadata.height ? MAX_LONG_SIDE : undefined, height: metadata.width && metadata.height && metadata.width <= metadata.height ? MAX_LONG_SIDE : undefined, fit: 'inside' }) : image;
  const outputBuffer = await resized.toFormat(metadata.format === 'png' ? 'png' : 'jpeg').toBuffer();
  const finalMeta = await sharp(outputBuffer).metadata();
  return {
    buffer: outputBuffer,
    width: finalMeta.width ?? metadata.width ?? 0,
    height: finalMeta.height ?? metadata.height ?? 0,
    format: (finalMeta.format ?? 'jpeg') as 'jpeg' | 'png'
  };
}

export async function applyWatermark(baseBuffer: Buffer, opts: { watermark: boolean; simpleLabel: boolean; format: 'png' | 'jpeg' }) {
  let img = sharp(baseBuffer).removeAlpha();
  const metadata = await img.metadata();
  const composites: sharp.OverlayOptions[] = [];
  if (opts.watermark) {
    const watermarkSvg = `<svg width="${metadata.width}" height="${metadata.height}"><text x="${(metadata.width ?? 0) - 20}" y="${(metadata.height ?? 0) - 20}" font-size="${Math.max(12, (metadata.width ?? 0) / 30)}" fill="rgba(255,255,255,0.6)" text-anchor="end" font-family="'Segoe UI',sans-serif">Quick Demo</text></svg>`;
    composites.push({ input: Buffer.from(watermarkSvg), gravity: 'southeast' });
  }
  if (opts.simpleLabel) {
    const labelSvg = `<svg width="${metadata.width}" height="${metadata.height}"><rect x="20" y="20" rx="12" ry="12" width="${Math.max(120, (metadata.width ?? 0) / 4)}" height="40" fill="rgba(34,197,94,0.8)"/><text x="${20 + Math.max(120, (metadata.width ?? 0) / 4) / 2}" y="48" font-size="20" fill="rgba(15,23,42,0.9)" text-anchor="middle" font-family="'Segoe UI',sans-serif">簡易カラー化</text></svg>`;
    composites.push({ input: Buffer.from(labelSvg), gravity: 'northwest' });
  }
  if (composites.length) {
    img = img.composite(composites);
  }
  return img.toFormat(opts.format).toBuffer();
}
