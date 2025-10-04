const { MATERIALS } = require('./constants');

const THEMES = {
  spring: {
    id: 'spring',
    visualSkin: { palette: 'pastel', motif: 'blossom' },
    passiveBonus: { material: 'wood', bonusPct: 0.05 },
    unlocked: true,
    fx: { bigCinematic: 'spring-garden-pan' },
  },
  summer: {
    id: 'summer',
    visualSkin: { palette: 'vibrant', motif: 'sun' },
    passiveBonus: { material: 'food', bonusPct: 0.05 },
    unlocked: true,
    fx: { bigCinematic: 'summer-festival-pan' },
  },
  autumn: {
    id: 'autumn',
    visualSkin: { palette: 'amber', motif: 'maple' },
    passiveBonus: { material: 'stone', bonusPct: 0.05 },
    unlocked: true,
    fx: { bigCinematic: 'autumn-breeze-pan' },
  },
  winter: {
    id: 'winter',
    visualSkin: { palette: 'frost', motif: 'snow' },
    passiveBonus: { material: 'ore', bonusPct: 0.05 },
    unlocked: true,
    fx: { bigCinematic: 'winter-silence-pan' },
  },
  hanabi: {
    id: 'hanabi',
    visualSkin: { palette: 'night', motif: 'firework' },
    passiveBonus: { material: 'rare', bonusPct: 0.05 },
    unlocked: false,
    fx: { bigCinematic: 'hanabi-finale' },
  },
};

const BUFF_LIBRARY = {
  lanternGlow: {
    id: 'lanternGlow',
    kind: 'comboPersist',
    value: 1,
    charges: 1,
    rarity: 'common',
  },
  lanternBurst: {
    id: 'lanternBurst',
    kind: 'multiplier',
    value: 3,
    charges: 1,
    rarity: 'rare',
  },
  sunflowerBoostSmall: {
    id: 'sunflowerBoostSmall',
    kind: 'multiplier',
    value: 2,
    charges: 2,
    rarity: 'common',
  },
  sunflowerBoostLarge: {
    id: 'sunflowerBoostLarge',
    kind: 'multiplier',
    value: 5,
    charges: 1,
    rarity: 'legend',
  },
  bonsaiLeaves: {
    id: 'bonsaiLeaves',
    kind: 'comboAdd',
    value: 2,
    charges: 1,
    rarity: 'rare',
  },
  fireworksCascade: {
    id: 'fireworksCascade',
    kind: 'comboEndMultiplier',
    value: 3,
    charges: 1,
    rarity: 'legend',
    trigger: 'comboEnd',
  },
};

const BLOCK_DEFS = {
  sakuraLantern: {
    id: 'sakuraLantern',
    type: 'light',
    fx: {
      small: { id: 'fx-sakura-glow', color: 'pink' },
      large: { id: 'fx-sakura-burst', color: 'rose' },
    },
    smallEvent: { chance: 0.1, reward: BUFF_LIBRARY.lanternGlow },
    largeEvent: {
      chance: 0.02,
      reward: BUFF_LIBRARY.lanternBurst,
      gatedByCombo: 10,
    },
    themeAffinity: 'spring',
  },
  sunflowerPot: {
    id: 'sunflowerPot',
    type: 'drop',
    drop: {
      material: 'food',
      amountMin: 3,
      amountMax: 6,
      cooldownSec: 15,
      chance: 0.5,
    },
    placementLimit: 5,
    fx: {
      small: { id: 'fx-sunflower-glimmer', color: 'gold' },
      large: { id: 'fx-sunflower-flare', color: 'amber' },
    },
    smallEvent: {
      chance: 0.12,
      reward: BUFF_LIBRARY.sunflowerBoostSmall,
    },
    largeEvent: {
      chance: 0.03,
      reward: BUFF_LIBRARY.sunflowerBoostLarge,
      gatedByCombo: 15,
    },
    themeAffinity: 'summer',
  },
  mapleBonsai: {
    id: 'mapleBonsai',
    type: 'drop',
    drop: {
      material: 'wood',
      amountMin: 2,
      amountMax: 4,
      cooldownSec: 20,
      chance: 0.4,
    },
    placementLimit: 2,
    fx: {
      small: { id: 'fx-maple-rustle', color: 'amber' },
      large: { id: 'fx-maple-storm', color: 'crimson' },
    },
    smallEvent: {
      chance: 0.08,
      reward: BUFF_LIBRARY.bonsaiLeaves,
    },
    largeEvent: {
      chance: 0.02,
      reward: BUFF_LIBRARY.fireworksCascade,
      gatedByCombo: 20,
    },
    themeAffinity: 'autumn',
  },
  winterLamp: {
    id: 'winterLamp',
    type: 'light',
    fx: {
      small: { id: 'fx-winter-spark', color: 'cyan' },
      large: { id: 'fx-winter-aurora', color: 'blue' },
    },
    smallEvent: { chance: 0.06 },
    largeEvent: {
      chance: 0.015,
      reward: BUFF_LIBRARY.lanternBurst,
      gatedByCombo: 25,
    },
    themeAffinity: 'winter',
  },
};

function cloneBuff(buff) {
  if (!buff) return undefined;
  return Object.assign({ remaining: buff.charges, trigger: buff.trigger || 'placement' }, buff);
}

module.exports = {
  THEMES,
  BLOCK_DEFS,
  BUFF_LIBRARY,
  cloneBuff,
  MATERIALS,
};
