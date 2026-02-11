import Foundation

enum GameID: String, CaseIterable, Identifiable {
    case neonReflex
    case paperPlane
    case precisionSniper
    case gravityCube
    case statBattle
    case hexHunter
    case miniCity
    case reverseMemory
    case oneButtonRunner
    case probabilityWizard

    var id: String { rawValue }

    var title: String {
        switch self {
        case .neonReflex: return "Neon Reflex Reactor"
        case .paperPlane: return "Paper Plane Drift"
        case .precisionSniper: return "Precision Sniper"
        case .gravityCube: return "Gravity Cube Puzzle"
        case .statBattle: return "Stat Battle"
        case .hexHunter: return "Hex Hunter"
        case .miniCity: return "Mini City Builder"
        case .reverseMemory: return "Reverse Memory Drop"
        case .oneButtonRunner: return "One Button Runner"
        case .probabilityWizard: return "Probability Wizard"
        }
    }

    var shortDescription: String {
        switch self {
        case .neonReflex: return "React fast, ignore fake flashes."
        case .paperPlane: return "Tilt to dodge wind zones."
        case .precisionSniper: return "Stop aim at exact center."
        case .gravityCube: return "Rotate gravity to reach goal."
        case .statBattle: return "Allocate stats, win 3 fights."
        case .hexHunter: return "Find the odd byte quickly."
        case .miniCity: return "Place buildings for best yield."
        case .reverseMemory: return "Input shown sequence in reverse."
        case .oneButtonRunner: return "Tap jump, avoid obstacles."
        case .probabilityWizard: return "Pick highest expected value."
        }
    }
}
