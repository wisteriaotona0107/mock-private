// src/fire.ts
// 焚き火のパーティクルと熱揺らぎシミュレーション。

import { CONFIG } from './state';
import { randRange } from './utils';

export interface FireParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export interface FireSimulation {
  particles: FireParticle[];
  flicker: number;
  time: number;
}

export function createFireSimulation(): FireSimulation {
  return {
    particles: [],
    flicker: 1,
    time: 0
  };
}

export function updateFire(sim: FireSimulation, dt: number): void {
  sim.time += dt;
  const target = 1 + Math.sin(sim.time * 1.7) * 0.2 + (Math.random() - 0.5) * CONFIG.fire.flickerStrength;
  sim.flicker = sim.flicker * 0.85 + target * 0.15;

  const spawnCount = CONFIG.fire.particleRate * dt * sim.flicker;
  for (let i = 0; i < spawnCount; i++) {
    sim.particles.push(createParticle());
  }

  const gravity = -20;
  for (let i = sim.particles.length - 1; i >= 0; i--) {
    const p = sim.particles[i];
    p.life += dt;
    if (p.life >= p.maxLife) {
      sim.particles.splice(i, 1);
      continue;
    }
    const t = p.life / p.maxLife;
    p.vx *= 0.98;
    p.vy += gravity * dt * (0.3 + Math.random() * 0.2);
    p.x += p.vx * dt * 60;
    p.y += p.vy * dt * 60;
    p.size *= 0.995 - t * 0.05;
    if (p.size < 2) {
      sim.particles.splice(i, 1);
    }
  }
}

function createParticle(): FireParticle {
  return {
    x: randRange(-30, 30),
    y: randRange(-10, 10),
    vx: randRange(-5, 5),
    vy: randRange(35, 55),
    life: 0,
    maxLife: randRange(CONFIG.fire.particleLifetime[0], CONFIG.fire.particleLifetime[1]),
    size: randRange(10, 22)
  };
}

export function getFireHeatFactor(sim: FireSimulation): number {
  return 0.6 + sim.flicker * 0.5;
}

export function getHeatAtHeight(height: number): number {
  const normalized = Math.max(0, 1 - Math.abs(height) / CONFIG.fire.radius);
  return CONFIG.fire.ambientHeat * normalized;
}
