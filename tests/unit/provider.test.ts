import { getProvider, resolveProvider } from '@/lib/inference/provider';

describe('provider resolution', () => {
  it('returns mock provider when DEV_MOCK_PROVIDER is set', async () => {
    process.env.DEV_MOCK_PROVIDER = '1';
    const providerName = resolveProvider();
    expect(providerName).toBe('mock');
    const provider = await getProvider(providerName);
    const result = await provider.colorize('https://example.com/input.png', { longSideMax: 2000 });
    expect(result.resultUrl).toContain('https://');
  });
});
