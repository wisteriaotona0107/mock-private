/**
 * Deterministic pseudo-random generator and simple 1D value noise helper.
 */
export class NoiseGenerator {
  private readonly seed: number;

  constructor(seed: number) {
    this.seed = seed >>> 0;
  }

  private hash(x: number): number {
    let h = (x ^ (x << 13)) ^ this.seed;
    h = (h * 15731) ^ (h >>> 7);
    h = (h * 789221) ^ (h >>> 11);
    h = (h * 1376312589) & 0x7fffffff;
    return h / 0x7fffffff;
  }

  private lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Sample smoothed noise in the range [-1, 1].
   */
  sample(x: number): number {
    const xi = Math.floor(x);
    const xf = x - xi;
    const v1 = this.hash(xi);
    const v2 = this.hash(xi + 1);
    const smooth = xf * xf * (3 - 2 * xf);
    return this.lerp(v1, v2, smooth) * 2 - 1;
  }

  /**
   * Fractional Brownian Motion helper for terrain-like curves.
   */
  fbm(x: number, octaves = 4, gain = 0.5, lacunarity = 2.0): number {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let ampTotal = 0;
    for (let i = 0; i < octaves; i += 1) {
      sum += this.sample(x * frequency) * amplitude;
      ampTotal += amplitude;
      amplitude *= gain;
      frequency *= lacunarity;
    }
    return sum / (ampTotal || 1);
  }
}
