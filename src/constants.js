const MATERIALS = ['wood', 'stone', 'ore', 'food', 'rare'];

const BASE_YIELD = {
  wood: 5,
  stone: 5,
  ore: 4,
  food: 6,
  rare: 1,
};

const COMBO_REWARD_THRESHOLDS = [
  { hits: 3, bonusMultiplier: 1.1 },
  { hits: 5, bonusMultiplier: 1.25 },
  { hits: 10, bonusMultiplier: 1.5 },
  { hits: 20, bonusMultiplier: 2 },
];

const HIGH_STAKES_CONFIG = {
  minimumCombo: 40,
  offerChance: 0.15,
  successChance: 0.5,
};

const BASE_COMBO_PAYOUT = {
  material: 'rare',
  amountPerHit: 0.5,
};

module.exports = {
  MATERIALS,
  BASE_YIELD,
  COMBO_REWARD_THRESHOLDS,
  HIGH_STAKES_CONFIG,
  BASE_COMBO_PAYOUT,
};
