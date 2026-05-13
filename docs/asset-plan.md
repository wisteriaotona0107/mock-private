# Asset Plan

## Directory Layout
```text
Assets/
  Images/
    Hats/
    NPCs/
    Backgrounds/
    UI/
    Effects/
  Data/
    hats.json
    npcs.json
    buffs.json
    stages.json
    scoring_rules.json
```

## Naming Rules
- `hat_<category>_<name>_<variant>.png`
- `npc_<role>_<mood>_<variant>.png`
- `bg_<theme>_<time>_<variant>.png`
- `ui_<type>_<name>.png`
- `fx_<action>_<level>.png`

## Format & Sizes (initial guideline)
- Gameplay sprites: PNG, power-of-two-friendly dimensions.
- UI icons: 256–512px source.
- Backgrounds: portrait-friendly, e.g., 1242x2688 source.
- Transparent PNG required for hats/NPC cutouts/UI icons/effects.

## Placeholder vs Production
- Keep placeholder assets under identifiable suffix/prefix.
- Never overwrite production-ready assets silently.
