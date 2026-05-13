# Data Schema Draft (Design Only)

## hats.json fields
id, name, rarity, category, baseScore, tags, strongAgainst, weakAgainst, cityThemeEffects, specialEffect, assetName

## npcs.json fields
id, name, role, tags, difficulty, preferredHats, dislikedHats, reactionType, scoreMultiplier, cityThemeContribution, assetName

## buffs.json fields
id, name, category, description, target, effect, rarity, riskLevel

## stages.json fields (proposal)
id, turn, baseThemeWeights, npcPool, difficultyMod, specialRules

## scoring_rules.json fields (proposal)
baseHit, compatibilityTable, justTimingBonus, comboRules, themeSynergyRules, riskModifiers, finalEvalWeights
