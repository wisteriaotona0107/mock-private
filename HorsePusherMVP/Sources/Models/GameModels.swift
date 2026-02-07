import Foundation

enum GameState: String, Codable {
    case idle
    case betting
    case racing
    case result
}

struct GameConfig: Codable {
    let multiplierMax: Double
    let betPresets: [Int]
    let baseCoins: Int
    let boostAmount: Double
}

struct Horse: Codable, Identifiable {
    let id: Int
    let frame: Int
    let number: Int
    let name: String
    let odds: Double
    let popularity: Int
    let jockey: String
}

struct Item: Codable, Identifiable {
    let id: Int
    let name: String
    let effectValue: Double
    let description: String
}

struct RaceResult {
    let ranking: [Horse]
    let winningHorse: Horse
}

struct LogEntry: Identifiable, Codable {
    let id: UUID
    let message: String
    let timestamp: Date

    init(message: String, timestamp: Date = Date()) {
        self.id = UUID()
        self.message = message
        self.timestamp = timestamp
    }
}

enum PusherReward: String, Codable {
    case boost
    case lucky
    case insurance
}
