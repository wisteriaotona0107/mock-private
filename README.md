# Pose Master (SwiftUI + SpriteKit) v0.2

Offline rhythm/pose game prototype for iPhone + iPad with flashy combo-scaled VFX.

## Xcode project setup (iOS 18.6+, Swift 5.10+)

1. Create a new **App** project in Xcode named `PoseMaster`.
2. Set:
   - Interface: **SwiftUI**
   - Language: **Swift**
   - Minimum iOS: **18.6**
3. Add these folders as groups:
   - `PoseMasterApp/Views`
   - `PoseMasterApp/Engine`
   - `PoseMasterApp/Models`
   - `PoseMasterApp/Systems`
   - `PoseMasterApp/Resources`
4. Add all `*.swift` files to target membership.
5. Add `poses.json` and `rules.json` into the app bundle (**Copy items if needed**).
6. Add pose assets in asset catalog / bundle:
   - Image sequence mode: `poseA_01...poseA_12` format
   - Video mode: `poseC_clip.mp4`, `poseS_clip.mp4`
7. Build & run on iPhone/iPad simulator/device.

## Project structure

```text
PoseMasterApp/
  PoseMasterApp.swift
  Models/
    GameModels.swift
  Engine/
    GameEngine.swift
  Systems/
    BundleDataLoader.swift
    PoseVisualPlayer.swift
    VFXScene.swift
  Views/
    RootView.swift
    SharedViews.swift
    TitleView.swift
    GameView.swift
    ResultView.swift
  Resources/
    poses.json
    rules.json
```

## Feature mapping

- **Screens**: Title / Game / Result in SwiftUI.
- **Game loop**: `GameEngine` runs 60 fps timer + beatmap timing (`CACurrentMediaTime()`).
- **Scoring**: PERFECT/GREAT/GOOD/MISS windows, combo tiers, sequence bonus, finish bonus.
- **Pose visuals**: `PoseVisualView` + `PoseVisualPlayer` abstraction with:
  - `PoseAssetType.imageSequence`
  - `PoseAssetType.videoClip`
  - Missing assets fallback silhouette so prototype still runs.
- **VFX overlay**: SpriteKit `StageVFXScene` on top of stage:
  - Dust / Sparks / Confetti emitters
  - Shockwave ring
  - HYPE text pop
  - Combo-driven flare/strobe/prism overlay (bounded alpha/frequency)
  - Stage shake scaling with combo
- **Persistence**: High score saved locally via `UserDefaults`.

## Notes

- No networking used.
- No external packages used.
- Designed for responsive iPhone/iPad layout using `GeometryReader` and adaptive stacks.
