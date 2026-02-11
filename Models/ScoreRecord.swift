import Foundation

struct ScoreRecord: Codable {
    var score: Int
    var best: Int
    var plays: Int
    var lastPlayed: Date

    static let empty = ScoreRecord(score: 0, best: 0, plays: 0, lastPlayed: .distantPast)
}
