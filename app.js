(() => {
  const DEFAULT_CONFIG = {
    conversion: {
      divisor: 2,
      minKushiForOneShot: 3,
      minShots: 1,
    },
    rareFailProb: 0.02,
    prizeTable: {
      SSR: { prob: 0.01, fortune: '大吉', prize: 'ドリンク無料' },
      SR: { prob: 0.05, fortune: '吉', prize: '半額' },
      R: { prob: 0.2, fortune: '中吉', prize: '100円引' },
      N: { prob: 0.74, fortune: '小吉', prize: 'また挑戦！' },
    },
    aimAssist: {
      ssrMaxBoost: 0.025,
      srMaxBoost: 0.03,
    },
  };

  const STORAGE_KEY = 'kushiDartsConfigV1';
  const state = {
    mode: 'counter',
    config: loadConfig(),
    soundEnabled: false,
    kushiCount: 0,
    shotsTotal: 0,
    shotsLeft: 0,
    pointerActive: false,
    dragStart: null,
    dragCurrent: null,
    projectile: null,
    particles: [],
    frameTimes: [],
    perfParticleCap: 120,
    lastResult: null,
    aimQuality: 0,
  };

  const el = {
    counterScreen: document.getElementById('counterScreen'),
    gameScreen: document.getElementById('gameScreen'),
    resultScreen: document.getElementById('resultScreen'),
    kushiCount: document.getElementById('kushiCount'),
    shotCount: document.getElementById('shotCount'),
    shotRuleText: document.getElementById('shotRuleText'),
    minusBtn: document.getElementById('minusBtn'),
    plusBtn: document.getElementById('plusBtn'),
    startGameBtn: document.getElementById('startGameBtn'),
    remainShots: document.getElementById('remainShots'),
    hudKushi: document.getElementById('hudKushi'),
    gameMessage: document.getElementById('gameMessage'),
    powerMeterInner: document.querySelector('#powerMeter span'),
    canvas: document.getElementById('gameCanvas'),
    nextPlayBtn: document.getElementById('nextPlayBtn'),
    finishBtn: document.getElementById('finishBtn'),
    fortuneText: document.getElementById('fortuneText'),
    prizeText: document.getElementById('prizeText'),
    soundToggle: document.getElementById('soundToggle'),
    adminTrigger: document.getElementById('adminTrigger'),
    adminDialog: document.getElementById('adminDialog'),
    adminJson: document.getElementById('adminJson'),
    saveAdminBtn: document.getElementById('saveAdminBtn'),
    resetAdminBtn: document.getElementById('resetAdminBtn'),
  };

  const ctx = el.canvas.getContext('2d');
  const target = { x: el.canvas.width * 0.5, y: el.canvas.height * 0.43, radius: 160 };
  let audioCtx = null;
  let holdTimer = null;

  function loadConfig() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return structuredClone(DEFAULT_CONFIG);
      const parsed = JSON.parse(raw);
      return deepMerge(structuredClone(DEFAULT_CONFIG), parsed);
    } catch {
      return structuredClone(DEFAULT_CONFIG);
    }
  }

  function deepMerge(base, patch) {
    if (!patch || typeof patch !== 'object') return base;
    Object.keys(patch).forEach((k) => {
      if (patch[k] && typeof patch[k] === 'object' && !Array.isArray(patch[k]) && typeof base[k] === 'object') {
        base[k] = deepMerge(base[k], patch[k]);
      } else {
        base[k] = patch[k];
      }
    });
    return base;
  }

  function saveConfig() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.config));
  }

  function calcShots(kushi) {
    const c = state.config.conversion;
    let shots = Math.floor(kushi / Math.max(1, c.divisor));
    if (kushi >= c.minKushiForOneShot) shots = Math.max(shots, c.minShots);
    return Math.max(0, shots);
  }

  function setMode(mode) {
    state.mode = mode;
    [el.counterScreen, el.gameScreen, el.resultScreen].forEach((node) => node.classList.remove('active'));
    if (mode === 'counter') el.counterScreen.classList.add('active');
    if (mode === 'game') el.gameScreen.classList.add('active');
    if (mode === 'result') el.resultScreen.classList.add('active');
  }

  function updateCounterUI() {
    const shots = calcShots(state.kushiCount);
    state.shotsTotal = shots;
    el.kushiCount.textContent = String(state.kushiCount);
    el.shotCount.textContent = String(shots);
    const c = state.config.conversion;
    el.shotRuleText.textContent = `shots = floor(串本数 / ${c.divisor}), ${c.minKushiForOneShot}本以上で最低${c.minShots}回`;
    el.startGameBtn.disabled = shots <= 0;
  }

  function startGame() {
    state.shotsLeft = state.shotsTotal;
    el.remainShots.textContent = String(state.shotsLeft);
    el.hudKushi.textContent = String(state.kushiCount);
    el.gameMessage.textContent = 'ドラッグして狙い、離して発射！';
    state.projectile = null;
    state.particles = [];
    setMode('game');
  }

  function safeVibrate(pattern) {
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {}
  }

  function ensureAudio() {
    try {
      if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      if (audioCtx.state === 'suspended') audioCtx.resume();
    } catch {}
  }

  function playSE(type) {
    if (!state.soundEnabled || !audioCtx) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain).connect(audioCtx.destination);
    if (type === 'throw') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.15);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.start(now); osc.stop(now + 0.18);
      return;
    }
    if (type === 'hit') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(400, now);
      gain.gain.setValueAtTime(0.13, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now); osc.stop(now + 0.13);
      return;
    }
    if (type === 'win') {
      osc.type = 'sine';
      [523, 659, 784].forEach((f, i) => osc.frequency.setValueAtTime(f, now + i * 0.08));
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now); osc.stop(now + 0.36);
      return;
    }
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(90, now + 0.22);
    gain.gain.setValueAtTime(0.11, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.23);
    osc.start(now); osc.stop(now + 0.24);
  }

  function weightedResult(aimQuality) {
    const table = state.config.prizeTable;
    const fail = clamp(state.config.rareFailProb, 0, 0.05);
    const ssrBoost = state.config.aimAssist.ssrMaxBoost * aimQuality;
    const srBoost = state.config.aimAssist.srMaxBoost * aimQuality;
    const adjusted = {
      SSR: clamp(table.SSR.prob + ssrBoost, 0, 0.2),
      SR: clamp(table.SR.prob + srBoost, 0, 0.3),
      R: table.R.prob,
      N: table.N.prob,
    };
    const totalWithoutFail = adjusted.SSR + adjusted.SR + adjusted.R + adjusted.N;
    Object.keys(adjusted).forEach((k) => adjusted[k] = adjusted[k] / totalWithoutFail * (1 - fail));

    const roll = Math.random();
    if (roll < fail) return { rank: 'FAIL', fortune: '凶', prize: '特典なし…', isBig: false };
    const roll2 = (roll - fail) / (1 - fail);
    let acc = 0;
    for (const rank of ['SSR', 'SR', 'R', 'N']) {
      acc += adjusted[rank];
      if (roll2 <= acc) return { rank, ...table[rank], isBig: rank === 'SSR' || rank === 'SR' };
    }
    return { rank: 'N', ...table.N, isBig: false };
  }

  function clamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

  function pointerToCanvas(ev) {
    const rect = el.canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left) * (el.canvas.width / rect.width),
      y: (ev.clientY - rect.top) * (el.canvas.height / rect.height),
    };
  }

  function drawBoard() {
    ctx.clearRect(0, 0, el.canvas.width, el.canvas.height);
    const rings = [
      { r: target.radius, c: '#20317d', label: 'N' },
      { r: target.radius * 0.76, c: '#3f3aa9', label: 'R' },
      { r: target.radius * 0.52, c: '#8f2fa8', label: 'SR' },
      { r: target.radius * 0.26, c: '#ff4ea0', label: 'SSR' },
    ];
    rings.forEach((ring) => {
      ctx.fillStyle = ring.c;
      ctx.beginPath();
      ctx.arc(target.x, target.y, ring.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = '#eaf6ff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    rings.forEach((ring, i) => ctx.fillText(ring.label, target.x, target.y - ring.r + 32 + i * 4));

    if (state.dragStart && state.dragCurrent && !state.projectile) {
      ctx.strokeStyle = '#8ff7ff';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(state.dragStart.x, state.dragStart.y);
      ctx.lineTo(state.dragCurrent.x, state.dragCurrent.y);
      ctx.stroke();
    }

    if (state.projectile) {
      ctx.save();
      ctx.translate(state.projectile.x, state.projectile.y);
      ctx.rotate(state.projectile.rotation);
      ctx.fillStyle = '#ffe36f';
      ctx.beginPath();
      ctx.moveTo(16, 0); ctx.lineTo(-10, 5); ctx.lineTo(-10, -5); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#47e8ff';
      ctx.fillRect(-18, -2, 8, 4);
      ctx.restore();
    }

    state.particles.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    });
  }

  function spawnParticles(x, y, type) {
    const base = type === 'big' ? 100 : type === 'fail' ? 38 : 55;
    const count = Math.min(base, state.perfParticleCap);
    for (let i = 0; i < count; i += 1) {
      const speed = (type === 'big' ? 5.4 : 3.2) * (0.5 + Math.random());
      const angle = Math.random() * Math.PI * 2;
      state.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.3,
        size: 2 + Math.random() * (type === 'big' ? 5 : 3),
        life: 25 + Math.random() * 30,
        maxLife: 55,
        color: type === 'fail' ? '#bbbbc8' : ['#48deff', '#ff4dd2', '#ffe37b', '#ffffff'][Math.floor(Math.random() * 4)],
      });
    }
  }

  function updateParticles() {
    state.particles = state.particles.filter((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.08;
      p.vx *= 0.985;
      p.life -= 1;
      return p.life > 0;
    });
  }

  function launchDart(from, to) {
    const dx = from.x - to.x;
    const dy = from.y - to.y;
    const power = clamp(Math.hypot(dx, dy) / 210, 0.18, 1.2);
    state.aimQuality = clamp(1 - distanceToTargetNorm(to.x, to.y), 0, 1);
    state.projectile = {
      x: from.x,
      y: from.y,
      vx: dx * 0.09,
      vy: dy * 0.09 - 2,
      gravity: 0.22,
      rotation: 0,
      landed: false,
      power,
    };
    el.powerMeterInner.style.height = `${Math.round(power / 1.2 * 100)}%`;
    el.gameMessage.textContent = '投擲！';
    playSE('throw');
  }

  function distanceToTargetNorm(x, y) {
    return clamp(Math.hypot(x - target.x, y - target.y) / target.radius, 0, 1);
  }

  function settleShot(impactX, impactY) {
    const result = weightedResult(state.aimQuality);
    state.lastResult = result;
    state.shotsLeft -= 1;
    el.remainShots.textContent = String(state.shotsLeft);

    const isHit = result.rank !== 'FAIL';
    el.canvas.classList.remove('flash', 'shake');
    void el.canvas.offsetWidth;

    if (result.rank === 'SSR') {
      el.canvas.classList.add('flash');
      spawnParticles(impactX, impactY, 'big');
      safeVibrate([50, 40, 60]);
      playSE('win');
    } else if (isHit) {
      el.canvas.classList.add('shake');
      spawnParticles(impactX, impactY, 'normal');
      safeVibrate(35);
      playSE('hit');
    } else {
      spawnParticles(impactX, impactY, 'fail');
      safeVibrate(16);
      playSE('fail');
    }

    el.gameMessage.textContent = `${result.fortune} ${result.prize}`;
    setTimeout(() => {
      showResult();
    }, 1050);
  }

  function showResult() {
    if (!state.lastResult) return;
    el.fortuneText.textContent = state.lastResult.fortune;
    el.prizeText.textContent = state.lastResult.prize;
    setMode('result');
  }

  function nextPlay() {
    if (state.shotsLeft > 0) {
      setMode('game');
      el.gameMessage.textContent = 'ドラッグして狙い、離して発射！';
      state.projectile = null;
      state.dragStart = null;
      state.dragCurrent = null;
      return;
    }
    toCounter();
  }

  function toCounter() {
    setMode('counter');
    state.kushiCount = 0;
    updateCounterUI();
  }

  function loop(ts) {
    try {
      state.frameTimes.push(ts);
      while (state.frameTimes.length > 45) state.frameTimes.shift();
      if (state.frameTimes.length > 12) {
        const d = state.frameTimes[state.frameTimes.length - 1] - state.frameTimes[0];
        const fps = ((state.frameTimes.length - 1) / d) * 1000;
        state.perfParticleCap = fps < 45 ? 65 : fps < 55 ? 90 : 120;
      }

      if (state.projectile && !state.projectile.landed) {
        state.projectile.vy += state.projectile.gravity;
        state.projectile.x += state.projectile.vx;
        state.projectile.y += state.projectile.vy;
        state.projectile.rotation = Math.atan2(state.projectile.vy, state.projectile.vx);

        if (state.projectile.y > target.y - 20 || state.projectile.y > el.canvas.height - 24) {
          state.projectile.landed = true;
          settleShot(state.projectile.x, state.projectile.y);
        }
      }

      updateParticles();
      drawBoard();
    } catch (err) {
      console.error('render fallback', err);
    }
    requestAnimationFrame(loop);
  }

  function openAdmin() {
    const editable = JSON.stringify(state.config, null, 2);
    el.adminJson.value = editable;
    el.adminDialog.showModal();
  }

  function bindEvents() {
    el.minusBtn.addEventListener('click', () => { state.kushiCount = Math.max(0, state.kushiCount - 1); updateCounterUI(); });
    el.plusBtn.addEventListener('click', () => { state.kushiCount += 1; updateCounterUI(); });
    el.startGameBtn.addEventListener('click', () => { if (state.shotsTotal > 0) startGame(); });
    el.nextPlayBtn.addEventListener('click', nextPlay);
    el.finishBtn.addEventListener('click', toCounter);

    el.soundToggle.addEventListener('change', () => {
      state.soundEnabled = el.soundToggle.checked;
      if (state.soundEnabled) ensureAudio();
    });

    ['pointerdown', 'pointermove', 'pointerup', 'pointercancel'].forEach((evt) => {
      el.canvas.addEventListener(evt, (e) => {
        if (state.mode !== 'game') return;
        if (evt === 'pointerdown') {
          ensureAudio();
          state.pointerActive = true;
          state.dragStart = pointerToCanvas(e);
          state.dragCurrent = state.dragStart;
        }
        if (evt === 'pointermove' && state.pointerActive) {
          state.dragCurrent = pointerToCanvas(e);
          const p = clamp(Math.hypot(state.dragStart.x - state.dragCurrent.x, state.dragStart.y - state.dragCurrent.y) / 210, 0, 1);
          el.powerMeterInner.style.height = `${Math.round(p * 100)}%`;
        }
        if ((evt === 'pointerup' || evt === 'pointercancel') && state.pointerActive) {
          state.pointerActive = false;
          if (!state.projectile && state.dragStart && state.dragCurrent) {
            launchDart(state.dragStart, state.dragCurrent);
          }
          state.dragStart = null;
          state.dragCurrent = null;
        }
      }, { passive: true });
    });

    el.adminTrigger.addEventListener('pointerdown', () => {
      holdTimer = setTimeout(openAdmin, 3000);
    });
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((evt) => {
      el.adminTrigger.addEventListener(evt, () => {
        clearTimeout(holdTimer);
      });
    });

    el.saveAdminBtn.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(el.adminJson.value);
        state.config = deepMerge(structuredClone(DEFAULT_CONFIG), parsed);
        saveConfig();
        updateCounterUI();
        el.adminDialog.close();
      } catch {
        alert('JSON形式が不正です。');
      }
    });

    el.resetAdminBtn.addEventListener('click', () => {
      state.config = structuredClone(DEFAULT_CONFIG);
      saveConfig();
      el.adminJson.value = JSON.stringify(state.config, null, 2);
      updateCounterUI();
    });

    document.body.addEventListener('pointerdown', ensureAudio, { once: true });
  }

  function init() {
    bindEvents();
    updateCounterUI();
    drawBoard();
    requestAnimationFrame(loop);
  }

  init();
})();
