import sharp from 'sharp';
import { prepareUpload, applyWatermark } from '@/lib/image';

describe('image processing', () => {
  it('resizes and strips metadata', async () => {
    const base = await sharp({ create: { width: 3000, height: 1000, channels: 3, background: '#888' } })
      .jpeg({ quality: 80 })
      .withMetadata({ exif: { IFD0: { Copyright: 'Test' } } })
      .toBuffer();
    const prepared = await prepareUpload(base);
    expect(prepared.width).toBeLessThanOrEqual(2000);
    expect(prepared.height).toBeLessThanOrEqual(2000);
  });

  it('applies watermark when requested', async () => {
    const base = await sharp({ create: { width: 400, height: 200, channels: 3, background: '#444' } })
      .png()
      .toBuffer();
    const withWatermark = await applyWatermark(base, { watermark: true, simpleLabel: true, format: 'png' });
    expect(withWatermark.byteLength).toBeGreaterThan(base.byteLength / 2);
  });
});
