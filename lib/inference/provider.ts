export interface IInferenceProvider {
  colorize(inputUrl: string, opts: { longSideMax: number }): Promise<{ resultUrl: string }>;
}

export type ProviderName = 'replicate' | 'huggingface' | 'mock';

export async function getProvider(name: ProviderName): Promise<IInferenceProvider> {
  if (name === 'replicate') {
    const module = await import('./replicate');
    return new module.ReplicateProvider();
  }
  if (name === 'huggingface') {
    const module = await import('./huggingface');
    return new module.HuggingFaceProvider();
  }
  const module = await import('./stub');
  return new module.MockProvider();
}

export function resolveProvider(): ProviderName {
  if (process.env.DEV_MOCK_PROVIDER === '1') return 'mock';
  return (process.env.DEFAULT_PROVIDER as ProviderName) ?? 'replicate';
}
