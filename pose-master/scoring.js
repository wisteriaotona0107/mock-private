export function createScoringSystem(rules) {
  let recentInputs = [];

  function getTimingResult(absDeltaMs) {
    if (absDeltaMs <= rules.timing.perfectMs) {
      return 'perfect';
    }
    if (absDeltaMs <= rules.timing.greatMs) {
      return 'great';
    }
    if (absDeltaMs <= rules.timing.goodMs) {
      return 'good';
    }
    return 'miss';
  }

  function getComboTier(combo) {
    let bestTier = rules.comboTiers[0];
    for (const tier of rules.comboTiers) {
      if (combo >= tier.minCombo) {
        bestTier = tier;
      }
    }
    return bestTier;
  }

  function checkSequenceBonus(inputId) {
    recentInputs.push(inputId);

    const maxPatternLength = Math.max(...rules.sequenceBonuses.map((item) => item.pattern.length), 1);
    if (recentInputs.length > maxPatternLength) {
      recentInputs = recentInputs.slice(-maxPatternLength);
    }

    for (const item of rules.sequenceBonuses) {
      const { pattern, bonus, name } = item;
      const tail = recentInputs.slice(-pattern.length);
      const matched = tail.length === pattern.length && tail.every((id, index) => id === pattern[index]);
      if (matched) {
        return { bonus, name };
      }
    }

    return null;
  }

  function computeHit({ pose, deltaMs, combo }) {
    const absDeltaMs = Math.abs(deltaMs);
    const timingKey = getTimingResult(absDeltaMs);
    const timingLabel = rules.timing.labels[timingKey];
    const timingMult = rules.timing.multipliers[timingKey];
    const tier = getComboTier(combo);

    const rawScore = pose.basePoint * timingMult * tier.multiplier;
    const hitScore = Math.round(rawScore);

    const sequence = timingKey === 'miss' ? null : checkSequenceBonus(pose.id);

    return {
      timingKey,
      timingLabel,
      timingMult,
      fxLevel: tier.fxLevel,
      comboMultiplier: tier.multiplier,
      hitScore,
      sequenceBonus: sequence
    };
  }

  function computeFinishBonus({ remainingMs, lastInputId }) {
    const inLastWindow = remainingMs <= rules.finishBonus.lastSec * 1000;
    const matched = lastInputId === rules.finishBonus.poseId;

    if (inLastWindow && matched) {
      return {
        hit: true,
        bonus: rules.finishBonus.bonus,
        message: 'FINISH BONUS'
      };
    }

    return { hit: false, bonus: 0, message: '' };
  }

  return {
    computeHit,
    computeFinishBonus,
    getComboTier
  };
}
