# AGENTS.md

## Project Mission
Build **"帽子を投げて、街を変える！"** as an iPhone portrait, turn-based roguelite-style hat-throw game using Swift + SpriteKit, with strong design consistency and data-driven structure.

## Non-Negotiable Workflow Rules
1. Do **not** jump to large implementation immediately.
2. Read existing `docs/*.md` before proposing or changing features.
3. Any spec change must update all related design docs in the same commit.
4. Preserve core game pillars (turn strategy, hat identity, city evolution).
5. Keep changes small and reviewable.

## Core Design Constraints
- One run = exactly **5 turns**.
- Each turn should feature **1–5 NPC targets** (never crowd spam as baseline).
- Hats are gameplay objects with effects (not cosmetic-only skins).
- After each turn, player chooses **1 buff from ~3 options**.
- Turn 5 includes a final challenge and **holistic final evaluation**.

## Tech & Architecture Direction
- Prefer **Swift + SpriteKit** for gameplay runtime.
- Prefer **JSON-driven definitions** (`hats.json`, `npcs.json`, `buffs.json`, `stages.json`, `scoring_rules.json`).
- Keep gameplay logic decoupled from assets and UI skinning.

## Asset Pipeline Rules
- Assume final art is generated separately via GPT Image workflows.
- Keep placeholder assets and production assets separable.
- Use stable naming conventions and predictable folder structure.
- Do not model characters after real public figures or real persons.

## Content & Tone Safety
- Tone: bright, pop, slightly silly, non-violent, non-aggressive.
- Avoid hostile themes or visuals.
- Avoid direct likenesses of real celebrities/influencers.

## Delivery Expectations for Codex
- For design tasks: update docs first.
- For implementation tasks: follow `docs/implementation-roadmap.md` phase boundaries.
- Always include what was changed, why, and what remains open.
