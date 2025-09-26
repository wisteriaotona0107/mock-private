import { IInferenceProvider } from './provider';

export class MockProvider implements IInferenceProvider {
  async colorize(): Promise<{ resultUrl: string }> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return {
      resultUrl:
        'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=60'
    };
  }
}
