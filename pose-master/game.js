import { createScoringSystem } from './scoring.js';

const KEY_BINDINGS = {
  a: 'A',
  s: 'B',
  d: 'C',
  f: 'D',
  ' ': 'S'
};

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function randomFrom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function createNoteChart(poses, rules) {
  const notes = [];
  const startOffsetMs = 1600;
  const playDurationMs = rules.duration * 1000;
  const gapMs = (playDurationMs - startOffsetMs) / Math.max(rules.noteCount, 1);

  for (let i = 0; i < rules.noteCount; i += 1) {
    const pose = randomFrom(poses);
    notes.push({
      id: `note-${i}`,
      poseId: pose.id,
      lane: pose.lane,
      timeMs: startOffsetMs + i * gapMs,
      hit: false,
      judged: false
    });
  }

  return notes;
}

export class PoseMasterGame {
  constructor({ root, config }) {
    this.root = root;
    this.config = config;
    this.scoring = createScoringSystem(config.rules);

    this.state = {
      running: false,
      startTs: 0,
      nowMs: 0,
      score: 0,
      combo: 0,
      maxCombo: 0,
      fxLevel: 0,
      streak: [],
      lastInputId: null,
      judgments: { perfect: 0, great: 0, good: 0, miss: 0 },
      notes: [],
      currentIndex: 0,
      finalBonusAwarded: false
    };

    this.rafId = null;

    this.cacheDom();
    this.bindEvents();
    this.reset();
  }

  cacheDom() {
    this.dom = {
      startButton: this.root.querySelector('[data-role="start"]'),
      timer: this.root.querySelector('[data-role="timer"]'),
      score: this.root.querySelector('[data-role="score"]'),
      combo: this.root.querySelector('[data-role="combo"]'),
      maxCombo: this.root.querySelector('[data-role="max-combo"]'),
      fxLabel: this.root.querySelector('[data-role="fx-level"]'),
      judge: this.root.querySelector('[data-role="judge"]'),
      laneTrack: this.root.querySelector('[data-role="lane-track"]'),
      notesLayer: this.root.querySelector('[data-role="notes"]'),
      poseButtons: Array.from(this.root.querySelectorAll('[data-pose-id]')),
      summary: this.root.querySelector('[data-role="summary"]')
    };
  }

  bindEvents() {
    this.dom.startButton.addEventListener('click', () => {
      if (this.state.running) {
        this.reset();
      }
      this.start();
    });

    this.dom.poseButtons.forEach((button) => {
      button.addEventListener('click', () => {
        this.handleInput(button.dataset.poseId);
      });
    });

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      const mapped = KEY_BINDINGS[key];
      if (!mapped) {
        return;
      }
      event.preventDefault();
      this.handleInput(mapped);
    });
  }

  reset() {
    cancelAnimationFrame(this.rafId);

    this.state.running = false;
    this.state.startTs = 0;
    this.state.nowMs = 0;
    this.state.score = 0;
    this.state.combo = 0;
    this.state.maxCombo = 0;
    this.state.fxLevel = 0;
    this.state.lastInputId = null;
    this.state.currentIndex = 0;
    this.state.finalBonusAwarded = false;
    this.state.judgments = { perfect: 0, great: 0, good: 0, miss: 0 };
    this.state.notes = createNoteChart(this.config.poses, this.config.rules);

    this.renderNotes();
    this.renderHud('READY');
    this.setSummary('Press START to begin.');
    this.dom.startButton.textContent = 'START';
    this.root.classList.remove('is-running');
  }

  start() {
    this.state.running = true;
    this.state.startTs = performance.now();
    this.dom.startButton.textContent = 'RESTART';
    this.root.classList.add('is-running');
    this.tick();
  }

  endGame() {
    this.state.running = false;
    this.root.classList.remove('is-running');

    const bonus = this.scoring.computeFinishBonus({
      remainingMs: 0,
      lastInputId: this.state.lastInputId
    });

    if (bonus.hit && !this.state.finalBonusAwarded) {
      this.state.finalBonusAwarded = true;
      this.state.score += bonus.bonus;
      this.setJudgeText(`${bonus.message} +${bonus.bonus}`);
    }

    const { perfect, great, good, miss } = this.state.judgments;
    this.setSummary(
      `Final Score ${this.state.score} | Max Combo ${this.state.maxCombo} | P:${perfect} G:${great} Go:${good} M:${miss}`
    );
    this.renderHud('END');
  }

  tick = () => {
    if (!this.state.running) {
      return;
    }

    const elapsed = performance.now() - this.state.startTs;
    this.state.nowMs = elapsed;

    this.judgeMisses();
    this.renderNotes();
    this.renderHud();

    const totalMs = this.config.rules.duration * 1000;
    if (elapsed >= totalMs) {
      this.endGame();
      return;
    }

    this.rafId = requestAnimationFrame(this.tick);
  };

  judgeMisses() {
    const goodWindow = this.config.rules.timing.goodMs;

    while (this.state.currentIndex < this.state.notes.length) {
      const note = this.state.notes[this.state.currentIndex];
      if (note.judged) {
        this.state.currentIndex += 1;
        continue;
      }

      if (this.state.nowMs - note.timeMs > goodWindow) {
        note.judged = true;
        note.hit = false;
        this.applyMiss();
        this.state.currentIndex += 1;
      } else {
        break;
      }
    }
  }

  handleInput(poseId) {
    if (!this.state.running) {
      return;
    }

    const goodWindow = this.config.rules.timing.goodMs;
    const nextNote = this.findBestCandidate(poseId, goodWindow);

    if (!nextNote) {
      this.applyMiss('MISS');
      return;
    }

    const deltaMs = this.state.nowMs - nextNote.timeMs;
    nextNote.judged = true;
    nextNote.hit = true;

    const pose = this.config.poseById.get(poseId);
    const result = this.scoring.computeHit({
      pose,
      deltaMs,
      combo: this.state.combo
    });

    this.state.lastInputId = poseId;
    this.state.judgments[result.timingKey] += 1;

    if (result.timingKey === 'miss') {
      this.applyMiss(result.timingLabel);
      return;
    }

    this.state.combo += 1;
    this.state.maxCombo = Math.max(this.state.maxCombo, this.state.combo);
    this.state.fxLevel = result.fxLevel;
    this.state.score += result.hitScore;

    let bonusLabel = '';
    if (result.sequenceBonus) {
      this.state.score += result.sequenceBonus.bonus;
      bonusLabel = ` + ${result.sequenceBonus.name} +${result.sequenceBonus.bonus}`;
    }

    this.setJudgeText(`${result.timingLabel} +${result.hitScore}${bonusLabel}`);

    const remainingMs = this.config.rules.duration * 1000 - this.state.nowMs;
    const finishBonus = this.scoring.computeFinishBonus({
      remainingMs,
      lastInputId: poseId
    });

    if (finishBonus.hit && !this.state.finalBonusAwarded) {
      this.state.finalBonusAwarded = true;
      this.state.score += finishBonus.bonus;
      this.setJudgeText(`${result.timingLabel} +${result.hitScore} | ${finishBonus.message} +${finishBonus.bonus}`);
    }
  }

  findBestCandidate(poseId, windowMs) {
    let best = null;

    for (let i = this.state.currentIndex; i < this.state.notes.length; i += 1) {
      const note = this.state.notes[i];
      if (note.judged || note.poseId !== poseId) {
        continue;
      }

      const delta = Math.abs(this.state.nowMs - note.timeMs);
      if (delta > windowMs) {
        if (note.timeMs > this.state.nowMs + windowMs) {
          break;
        }
        continue;
      }

      if (!best || delta < Math.abs(this.state.nowMs - best.timeMs)) {
        best = note;
      }
    }

    return best;
  }

  applyMiss(label = 'MISS') {
    this.state.combo = 0;
    this.state.fxLevel = this.scoring.getComboTier(0).fxLevel;
    this.state.judgments.miss += 1;
    this.setJudgeText(label);
  }

  setJudgeText(text) {
    this.dom.judge.textContent = text;
    this.dom.judge.classList.remove('pulse');
    void this.dom.judge.offsetWidth;
    this.dom.judge.classList.add('pulse');
  }

  setSummary(text) {
    this.dom.summary.textContent = text;
  }

  renderHud(stateLabel) {
    const durationMs = this.config.rules.duration * 1000;
    const remainingMs = clamp(durationMs - this.state.nowMs, 0, durationMs);

    this.dom.timer.textContent = `${(remainingMs / 1000).toFixed(1)}s`;
    this.dom.score.textContent = String(this.state.score);
    this.dom.combo.textContent = String(this.state.combo);
    this.dom.maxCombo.textContent = String(this.state.maxCombo);
    this.dom.fxLabel.textContent = `FX ${this.state.fxLevel}${stateLabel ? ` • ${stateLabel}` : ''}`;

    this.root.style.setProperty('--fx-level', String(this.state.fxLevel));
  }

  renderNotes() {
    const windowMs = 2200;
    const timingNow = this.state.nowMs;

    this.dom.notesLayer.innerHTML = '';

    for (const note of this.state.notes) {
      if (note.judged) {
        continue;
      }

      const dt = note.timeMs - timingNow;
      if (Math.abs(dt) > windowMs) {
        continue;
      }

      const progress = 1 - (dt + windowMs) / (windowMs * 2);
      const x = clamp(progress, 0, 1) * 100;

      const node = document.createElement('div');
      node.className = `note lane-${note.lane}`;
      node.style.left = `${x}%`;
      node.style.top = `${this.getLaneOffset(note.lane)}%`;
      node.textContent = note.poseId;
      this.dom.notesLayer.appendChild(node);
    }
  }

  getLaneOffset(lane) {
    const map = { A: 8, B: 28, C: 48, D: 68, S: 88 };
    return map[lane] ?? 50;
  }
}
