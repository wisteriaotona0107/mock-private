const {
  BASE_YIELD,
  COMBO_REWARD_THRESHOLDS,
  HIGH_STAKES_CONFIG,
  BASE_COMBO_PAYOUT,
  MATERIALS,
} = require('./constants');
const { THEMES, BLOCK_DEFS, cloneBuff } = require('./data');

function createMaterialRecord(initial = 0) {
  const record = {};
  for (const material of MATERIALS) {
    record[material] = initial;
  }
  return record;
}

class GameEngine {
  constructor(options = {}) {
    this.blocks = options.blocks || BLOCK_DEFS;
    this.themes = options.themes || THEMES;
    this.metaState = options.metaState || this.createDefaultMeta();
    this.rng = options.rng || (() => Math.random());
    this.gambleDecider = options.gambleDecider || (() => 'cancel');
    this.eventLog = [];
    this.fxLog = [];
    const defaultTheme = options.defaultThemeId || this.getFirstUnlockedTheme();
    this.startRun({
      themeId: defaultTheme,
      modeOnCancel: options.defaultModeOnCancel || 'SKIP',
    });
  }

  createDefaultMeta() {
    const unlockedThemes = new Set();
    for (const theme of Object.values(this.themes)) {
      if (theme.unlocked) {
        unlockedThemes.add(theme.id);
      }
    }
    return {
      unlockedThemes,
      hiddenThemes: new Set(),
      unlockedBlocks: new Set(Object.keys(this.blocks)),
    };
  }

  getFirstUnlockedTheme() {
    const entry = Object.values(this.themes).find((theme) => theme.unlocked);
    return entry ? entry.id : Object.keys(this.themes)[0];
  }

  startRun({ themeId, modeOnCancel }) {
    const chosenTheme = this.metaState.unlockedThemes.has(themeId)
      ? themeId
      : this.getFirstUnlockedTheme();
    this.runState = {
      combo: 0,
      comboHistory: [],
      pendingBuffs: [],
      theme: chosenTheme,
      directionFocus: undefined,
      modeOnCancel: modeOnCancel || 'SKIP',
      materials: createMaterialRecord(0),
      lastPlacement: undefined,
      placedBlockCounts: {},
    };
    this.eventLog.push({
      type: 'runStarted',
      theme: this.runState.theme,
      modeOnCancel: this.runState.modeOnCancel,
    });
  }

  setDirectionFocus(material) {
    if (!MATERIALS.includes(material)) {
      throw new Error(`Unknown material focus: ${material}`);
    }
    this.runState.directionFocus = material;
    this.eventLog.push({ type: 'directionFocusSet', material });
  }

  clearDirectionFocus() {
    this.runState.directionFocus = undefined;
    this.eventLog.push({ type: 'directionFocusCleared' });
  }

  getTheme() {
    return this.themes[this.runState.theme];
  }

  instantiateBuff(buffDef, overrides = {}) {
    const base = cloneBuff(buffDef);
    if (!base) return undefined;
    const instance = Object.assign({}, base, overrides);
    if (typeof instance.remaining !== 'number') {
      instance.remaining = instance.charges;
    }
    if (!instance.trigger) {
      instance.trigger = 'placement';
    }
    return instance;
  }

  applyImmediateBuff(buffDef, directionMaterial) {
    const instance = this.instantiateBuff(buffDef);
    if (!instance) return undefined;
    if (directionMaterial) {
      instance.appliesTo = directionMaterial;
    } else if (!instance.appliesTo && this.runState.directionFocus) {
      instance.appliesTo = this.runState.directionFocus;
    }
    this.runState.pendingBuffs.push(instance);
    this.eventLog.push({
      type: 'buffApplied',
      buff: {
        id: instance.id,
        kind: instance.kind,
        remaining: instance.remaining,
        appliesTo: instance.appliesTo,
        trigger: instance.trigger,
      },
    });
    return instance;
  }

  onPlace(blockId, tagContext = {}, options = {}) {
    const block = this.blocks[blockId];
    if (!block) {
      throw new Error(`Unknown block: ${blockId}`);
    }
    this.ensurePlacementLimit(blockId, block);

    const material = tagContext.material || (block.drop && block.drop.material) || 'wood';
    const placementEffects = this.consumePlacementBuffs(material);
    const comboResult = this.updateCombo(tagContext, placementEffects);

    const base = this.getBaseYield(material, block, tagContext);
    const themeBonus = this.getThemeBonus(material);
    let gain = Math.floor(base * placementEffects.multiplier * (1 + themeBonus));
    if (placementEffects.zeroReward) {
      gain = 0;
    }
    this.grantMaterial(material, gain, {
      source: 'placement',
      blockId,
      combo: this.runState.combo,
      placementEffects,
    });

    this.processBlockEvents(block, material, options.directionMaterial);
    this.maybeOfferHighStakesGamble();

    return {
      gain,
      combo: this.runState.combo,
      comboResult,
      effects: placementEffects,
    };
  }

  ensurePlacementLimit(blockId, block) {
    const counts = this.runState.placedBlockCounts;
    const current = counts[blockId] || 0;
    if (block.placementLimit && current >= block.placementLimit) {
      throw new Error(`Placement limit reached for ${blockId}`);
    }
    counts[blockId] = current + 1;
  }

  getBaseYield(material, block, tagContext) {
    if (typeof tagContext.baseYield === 'number') {
      return tagContext.baseYield;
    }
    if (block && block.drop) {
      return (block.drop.amountMin + block.drop.amountMax) / 2;
    }
    return BASE_YIELD[material] || 1;
  }

  getThemeBonus(material) {
    const theme = this.getTheme();
    if (theme && theme.passiveBonus && theme.passiveBonus.material === material) {
      return theme.passiveBonus.bonusPct;
    }
    return 0;
  }

  consumePlacementBuffs(material) {
    let multiplier = 1;
    let comboAdd = 0;
    let comboPersist = false;
    let zeroReward = false;
    let rareGuarantee = false;
    const consumed = [];
    const nextPending = [];

    for (const buff of this.runState.pendingBuffs) {
      if (buff.trigger === 'comboEnd') {
        nextPending.push(buff);
        continue;
      }
      const applies = !buff.appliesTo || buff.appliesTo === material;
      if (applies) {
        switch (buff.kind) {
          case 'multiplier':
            multiplier *= buff.value;
            break;
          case 'rareGuarantee':
            rareGuarantee = true;
            break;
          case 'craftInstant':
            this.eventLog.push({ type: 'craftInstant', buffId: buff.id });
            break;
          case 'comboAdd':
            comboAdd += buff.value;
            break;
          case 'comboPersist':
            comboPersist = true;
            break;
          case 'zeroReward':
            zeroReward = true;
            break;
          default:
            break;
        }
      }
      const remaining = (buff.remaining || buff.charges || 0) - 1;
      if (remaining <= 0) {
        consumed.push(buff.id);
        this.eventLog.push({ type: 'buffExpired', buffId: buff.id });
      } else {
        nextPending.push(Object.assign({}, buff, { remaining }));
      }
    }

    this.runState.pendingBuffs = nextPending;

    return {
      multiplier,
      comboAdd,
      comboPersist,
      zeroReward,
      rareGuarantee,
      consumedBuffs: consumed,
    };
  }

  updateCombo(tagContext, placementEffects) {
    const increment = 1 + (placementEffects.comboAdd || 0);
    const previousCombo = this.runState.combo;

    if (!this.runState.lastPlacement) {
      this.runState.combo = increment;
      this.runState.lastPlacement = tagContext;
      this.eventLog.push({ type: 'comboStarted', combo: this.runState.combo });
      return { continued: false, endedCombo: 0 };
    }

    const matches = this.comboMatches(this.runState.lastPlacement, tagContext);
    if (matches || placementEffects.comboPersist) {
      this.runState.combo += increment;
      this.runState.lastPlacement = tagContext;
      this.eventLog.push({
        type: 'comboContinued',
        combo: this.runState.combo,
        increment,
        persisted: !matches && placementEffects.comboPersist,
      });
      return { continued: true, endedCombo: 0 };
    }

    const endedCombo = previousCombo;
    const settlement = this.finishCombo(endedCombo);
    this.runState.combo = increment;
    this.runState.lastPlacement = tagContext;
    this.eventLog.push({
      type: 'comboRestarted',
      previousCombo: endedCombo,
      newCombo: this.runState.combo,
      settlement,
    });
    return { continued: false, endedCombo };
  }

  comboMatches(last, current) {
    if (!last || !current) return false;
    if (last.category && current.category && last.category === current.category) {
      return true;
    }
    const lastTags = Array.isArray(last.tags) ? last.tags : [];
    const currentTags = Array.isArray(current.tags) ? current.tags : [];
    return lastTags.some((tag) => currentTags.includes(tag));
  }

  finishCombo(comboValue) {
    if (!comboValue) {
      return { payout: 0 };
    }
    const comboMultiplier = this.getComboRewardMultiplier(comboValue);
    const comboEndMultiplier = this.consumeComboEndBuffs();
    const basePayout = comboValue * BASE_COMBO_PAYOUT.amountPerHit;
    const payout = Math.floor(basePayout * comboMultiplier * comboEndMultiplier);
    if (payout > 0) {
      this.grantMaterial(BASE_COMBO_PAYOUT.material, payout, {
        source: 'comboEnd',
        combo: comboValue,
        comboMultiplier,
        comboEndMultiplier,
      });
    }
    this.runState.comboHistory.push(comboValue);
    this.eventLog.push({
      type: 'comboSettled',
      combo: comboValue,
      payout,
      comboMultiplier,
      comboEndMultiplier,
    });
    this.runState.combo = 0;
    this.runState.lastPlacement = undefined;
    return { payout };
  }

  getComboRewardMultiplier(comboValue) {
    let multiplier = 1;
    for (const tier of COMBO_REWARD_THRESHOLDS) {
      if (comboValue >= tier.hits) {
        multiplier = tier.bonusMultiplier;
      }
    }
    return multiplier;
  }

  consumeComboEndBuffs() {
    let multiplier = 1;
    const nextPending = [];
    for (const buff of this.runState.pendingBuffs) {
      if (buff.trigger !== 'comboEnd') {
        nextPending.push(buff);
        continue;
      }
      if (buff.kind === 'comboEndMultiplier') {
        multiplier *= buff.value;
      }
      const remaining = (buff.remaining || buff.charges || 0) - 1;
      if (remaining <= 0) {
        this.eventLog.push({ type: 'buffExpired', buffId: buff.id });
      } else {
        nextPending.push(Object.assign({}, buff, { remaining }));
      }
    }
    this.runState.pendingBuffs = nextPending;
    return multiplier;
  }

  grantMaterial(material, amount, context) {
    if (!this.runState.materials[material]) {
      this.runState.materials[material] = 0;
    }
    this.runState.materials[material] += amount;
    this.eventLog.push({ type: 'materialGain', material, amount, context });
  }

  processBlockEvents(block, material, directionMaterial) {
    if (block.smallEvent && this.roll(block.smallEvent.chance)) {
      this.playFx(block.fx && block.fx.small, { size: 'small', block: block.id });
      if (block.smallEvent.reward) {
        this.applyImmediateBuff(block.smallEvent.reward, directionMaterial);
      }
    }
    if (
      block.largeEvent &&
      (!block.largeEvent.gatedByCombo || this.runState.combo >= block.largeEvent.gatedByCombo) &&
      this.roll(block.largeEvent.chance)
    ) {
      this.playFx(block.fx && block.fx.large, { size: 'large', block: block.id });
      if (block.largeEvent.reward) {
        this.applyImmediateBuff(block.largeEvent.reward, directionMaterial);
      }
    }
  }

  maybeOfferHighStakesGamble() {
    if (this.runState.combo < HIGH_STAKES_CONFIG.minimumCombo) {
      return;
    }
    if (!this.roll(HIGH_STAKES_CONFIG.offerChance)) {
      return;
    }
    const theme = this.getTheme();
    this.eventLog.push({ type: 'highStakesOffered', combo: this.runState.combo });
    const choice = this.gambleDecider({ combo: this.runState.combo });
    if (choice !== 'challenge') {
      this.eventLog.push({ type: 'highStakesDeclined', combo: this.runState.combo });
      if (this.runState.modeOnCancel === 'VIEW_ONLY' && theme && theme.fx && theme.fx.bigCinematic) {
        this.playFx(theme.fx.bigCinematic, { context: 'gamble-cancel' });
      }
      return;
    }

    const success = this.roll(HIGH_STAKES_CONFIG.successChance);
    if (success) {
      const buff = this.applyImmediateBuff(
        {
          id: 'highStakesJackpot',
          kind: 'multiplier',
          value: 5,
          charges: 1,
          rarity: 'legend',
        },
        this.runState.directionFocus,
      );
      this.eventLog.push({ type: 'highStakesOutcome', result: 'success', buff });
    } else {
      const buff = this.applyImmediateBuff({
        id: 'highStakesBust',
        kind: 'zeroReward',
        value: 0,
        charges: 1,
        rarity: 'legend',
      });
      this.eventLog.push({ type: 'highStakesOutcome', result: 'failure', buff });
    }
  }

  roll(chance) {
    if (!chance) return false;
    return this.rng() < chance;
  }

  playFx(fxSpec, options = {}) {
    if (!fxSpec) return;
    const entry = { type: 'fx', fx: fxSpec, options };
    this.fxLog.push(entry);
    this.eventLog.push(entry);
  }

  forceEndCombo() {
    const endedCombo = this.runState.combo;
    return this.finishCombo(endedCombo);
  }

  getMaterials() {
    return Object.assign({}, this.runState.materials);
  }
}

module.exports = {
  GameEngine,
};
