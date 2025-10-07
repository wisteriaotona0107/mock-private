// src/audio.ts
// 簡易的なWebAudioサウンドの生成。

interface FireLoop {
  source: AudioBufferSourceNode;
  gain: GainNode;
}

export interface AudioSystem {
  context: AudioContext | null;
  fireLoop: FireLoop | null;
}

export const audioSystem: AudioSystem = {
  context: null,
  fireLoop: null
};

async function ensureContext(): Promise<AudioContext> {
  if (!audioSystem.context) {
    audioSystem.context = new AudioContext();
  }
  if (audioSystem.context.state === 'suspended') {
    await audioSystem.context.resume();
  }
  return audioSystem.context;
}

function createNoiseBuffer(context: AudioContext): AudioBuffer {
  const length = context.sampleRate * 2;
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) {
    data[i] = (Math.random() * 2 - 1) * 0.3;
  }
  return buffer;
}

export async function startFireLoop(): Promise<void> {
  const context = await ensureContext();
  stopFireLoop();
  const buffer = createNoiseBuffer(context);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.loop = true;

  const gain = context.createGain();
  gain.gain.value = 0.15;

  const filter = context.createBiquadFilter();
  filter.type = 'bandpass';
  filter.frequency.value = 800;
  filter.Q.value = 0.7;

  source.connect(filter);
  filter.connect(gain);
  gain.connect(context.destination);
  source.start();

  audioSystem.fireLoop = { source, gain };
}

export function stopFireLoop(): void {
  if (audioSystem.fireLoop) {
    try {
      audioSystem.fireLoop.source.stop();
    } catch (error) {
      // noop
    }
    audioSystem.fireLoop.gain.disconnect();
    audioSystem.fireLoop = null;
  }
}

export async function playSizzle(): Promise<void> {
  const context = await ensureContext();
  const buffer = context.createBuffer(1, context.sampleRate * 0.25, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) {
    const t = i / data.length;
    data[i] = (Math.random() * 2 - 1) * (1 - t) * 0.6;
  }
  const source = context.createBufferSource();
  source.buffer = buffer;
  const gain = context.createGain();
  gain.gain.value = 0.4;
  source.connect(gain).connect(context.destination);
  source.start();
}

export async function playDrink(): Promise<void> {
  const context = await ensureContext();
  const osc = context.createOscillator();
  osc.type = 'sine';
  osc.frequency.value = 520;
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0, context.currentTime);
  gain.gain.linearRampToValueAtTime(0.3, context.currentTime + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.4);
  osc.connect(gain).connect(context.destination);
  osc.start();
  osc.stop(context.currentTime + 0.4);
}

export async function setFireVolume(amount: number): Promise<void> {
  if (!audioSystem.fireLoop) {
    await startFireLoop();
  }
  if (audioSystem.fireLoop) {
    audioSystem.fireLoop.gain.gain.value = amount * 0.18;
  }
}
