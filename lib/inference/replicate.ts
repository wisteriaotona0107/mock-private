import fetch from 'node-fetch';
import { IInferenceProvider } from './provider';

const REPLICATE_BASE = 'https://api.replicate.com/v1';

export class ReplicateProvider implements IInferenceProvider {
  async colorize(inputUrl: string, opts: { longSideMax: number }): Promise<{ resultUrl: string }> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    try {
      const response = await fetch(`${REPLICATE_BASE}/predictions`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          version: process.env.REPLICATE_MODEL_REF,
          input: {
            image: inputUrl,
            max_size: opts.longSideMax
          }
        }),
        signal: controller.signal
      });
      if (!response.ok) {
        throw new Error(`Replicate request failed: ${response.status}`);
      }
      const prediction = await response.json();
      if (prediction.status === 'succeeded' && prediction.output) {
        clearTimeout(timeout);
        return { resultUrl: Array.isArray(prediction.output) ? prediction.output[0] : prediction.output }; // assume first url
      }
      const finalPrediction = await this.poll(prediction.id, controller);
      return { resultUrl: Array.isArray(finalPrediction.output) ? finalPrediction.output[0] : finalPrediction.output };
    } finally {
      clearTimeout(timeout);
    }
  }

  private async poll(id: string, controller: AbortController) {
    const started = Date.now();
    while (Date.now() - started < 9000) {
      await new Promise((resolve) => setTimeout(resolve, 700));
      const res = await fetch(`${REPLICATE_BASE}/predictions/${id}`, {
        headers: { Authorization: `Token ${process.env.REPLICATE_API_TOKEN}` },
        signal: controller.signal
      });
      if (!res.ok) throw new Error('Failed to poll Replicate');
      const data = await res.json();
      if (data.status === 'succeeded') return data;
      if (data.status === 'failed' || data.status === 'canceled') throw new Error('Replicate job failed');
    }
    throw new Error('Replicate timeout');
  }
}
