const assert = require('assert');
const { GameEngine } = require('../src/engine');

const testBlock = {
  comboBlock: {
    id: 'comboBlock',
    type: 'drop',
    drop: {
      material: 'wood',
      amountMin: 1,
      amountMax: 1,
      cooldownSec: 0,
      chance: 1,
    },
    placementLimit: 999,
    fx: {
      small: null,
      large: null,
    },
    smallEvent: { chance: 0 },
    largeEvent: { chance: 0 },
  },
};

function createRng(values) {
  let index = 0;
  return () => {
    if (index < values.length) {
      return values[index++];
    }
    return values.length ? values[values.length - 1] : Math.random();
  };
}

function placeMany(engine, count) {
  for (let i = 0; i < count; i += 1) {
    engine.onPlace('comboBlock', {
      material: 'wood',
      category: 'nature',
      tags: ['plant'],
    });
  }
}

function runTest(name, fn) {
  try {
    fn();
    console.log(`✔ ${name}`);
  } catch (error) {
    console.error(`✖ ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('offers high stakes gamble and applies success buff', () => {
  const rng = createRng([0.05, 0.1, 0.9]);
  const engine = new GameEngine({
    blocks: testBlock,
    rng,
    gambleDecider: () => 'challenge',
  });
  engine.setDirectionFocus('wood');
  placeMany(engine, 40);

  const outcomeEvent = engine.eventLog.find(
    (event) => event.type === 'highStakesOutcome' && event.result === 'success',
  );
  assert.ok(outcomeEvent, 'Expected high stakes success event');
  const pendingBuff = engine.runState.pendingBuffs.find((buff) => buff.id === 'highStakesJackpot');
  assert.ok(pendingBuff, 'Expected jackpot buff to be active');

  engine.onPlace('comboBlock', {
    material: 'wood',
    category: 'nature',
    tags: ['plant'],
  });
  const materials = engine.getMaterials();
  assert.strictEqual(materials.wood, 45);
});

runTest('view-only cancel plays cinematic without buff', () => {
  const rng = createRng([0.05, 0.9]);
  const engine = new GameEngine({
    blocks: testBlock,
    rng,
    gambleDecider: () => 'cancel',
    defaultModeOnCancel: 'VIEW_ONLY',
  });
  engine.setDirectionFocus('wood');
  placeMany(engine, 40);

  const declineEvent = engine.eventLog.find((event) => event.type === 'highStakesDeclined');
  assert.ok(declineEvent, 'Expected decline event');
  const outcomeEvent = engine.eventLog.find((event) => event.type === 'highStakesOutcome');
  assert.ok(!outcomeEvent, 'Did not expect an outcome event');
  assert.ok(
    engine.fxLog.some((fx) => fx.options && fx.options.context === 'gamble-cancel'),
    'Expected cancel cinematic to play',
  );
});

runTest('high stakes failure zeroes next reward but keeps combo alive', () => {
  const rng = createRng([0.05, 0.9, 0.9]);
  const engine = new GameEngine({
    blocks: testBlock,
    rng,
    gambleDecider: () => 'challenge',
  });
  engine.setDirectionFocus('wood');
  placeMany(engine, 40);

  const outcomeEvent = engine.eventLog.find(
    (event) => event.type === 'highStakesOutcome' && event.result === 'failure',
  );
  assert.ok(outcomeEvent, 'Expected failure outcome');

  engine.onPlace('comboBlock', {
    material: 'wood',
    category: 'nature',
    tags: ['plant'],
  });
  const materials = engine.getMaterials();
  assert.strictEqual(materials.wood, 40);
  assert.strictEqual(engine.runState.combo, 41);
  assert.strictEqual(engine.runState.pendingBuffs.length, 0);
});

if (process.exitCode) {
  process.exit(process.exitCode);
}
