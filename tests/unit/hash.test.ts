import { sha256 } from '@/lib/hash';

const sample = Buffer.from('hello world');

describe('sha256', () => {
  it('produces deterministic hash', async () => {
    const first = await sha256(sample);
    const second = await sha256(sample);
    expect(first).toEqual(second);
    expect(first).toMatch(/^[a-f0-9]{64}$/);
  });
});
