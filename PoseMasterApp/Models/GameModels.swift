import Foundation

enum Lane: String, Codable, CaseIterable {
    case A, B, C, D, S
}

enum PoseAssetType: String, Codable {
    case imageSequence
    case videoClip
}

struct PoseAsset: Codable {
    let type: PoseAssetType
    let name: String
}

struct PoseDefinition: Codable, Identifiable {
    let id: String
    let name: String
    let basePoint: Int
    let lane: Lane
    let asset: PoseAsset
}

struct PoseCatalog: Codable {
    let poses: [PoseDefinition]
}

struct Rules: Codable {
    let durationSeconds: Double
    let noteCount: Int
    let perfectMs: Double
    let greatMs: Double
    let goodMs: Double
    let finishWindowSeconds: Double

    static let `default` = Rules(durationSeconds: 60, noteCount: 96, perfectMs: 55, greatMs: 95, goodMs: 135, finishWindowSeconds: 6)
}

enum JudgeResult: String {
    case perfect = "PERFECT"
    case great = "GREAT"
    case good = "GOOD"
    case miss = "MISS"

    var multiplier: Double {
        switch self {
        case .perfect: return 1.0
        case .great: return 0.75
        case .good: return 0.5
        case .miss: return 0.0
        }
    }
}

struct Note: Identifiable {
    let id = UUID()
    let lane: Lane
    let time: CFTimeInterval
    let poseId: String
    var isHit: Bool = false
}

struct ComboTier {
    let minCombo: Int
    let scoreMultiplier: Double

    static let defaults: [ComboTier] = [
        .init(minCombo: 0, scoreMultiplier: 1.0),
        .init(minCombo: 10, scoreMultiplier: 1.15),
        .init(minCombo: 20, scoreMultiplier: 1.3),
        .init(minCombo: 30, scoreMultiplier: 1.5),
        .init(minCombo: 40, scoreMultiplier: 1.75)
    ]
}
