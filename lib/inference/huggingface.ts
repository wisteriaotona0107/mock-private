import fetch from 'node-fetch';
import { IInferenceProvider } from './provider';

export class HuggingFaceProvider implements IInferenceProvider {
  async colorize(inputUrl: string, opts: { longSideMax: number }): Promise<{ resultUrl: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(`https://api-inference.huggingface.co/models/${process.env.HF_MODEL}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ inputs: inputUrl, parameters: { max_size: opts.longSideMax } }),
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HF error ${response.status}`);
      const data = await response.json();
      if (!data || !data.url) throw new Error('Invalid HF response');
      return { resultUrl: data.url };
    } finally {
      clearTimeout(timeout);
    }
  }
}
