import Foundation

final class ScoreStore: ObservableObject {
    @Published private(set) var records: [GameID: ScoreRecord] = [:]

    private let defaults = UserDefaults.standard
    private let keyPrefix = "score.record."

    init() {
        loadAll()
    }

    func load(_ game: GameID) -> ScoreRecord {
        if let cached = records[game] { return cached }
        let key = keyPrefix + game.rawValue
        guard let data = defaults.data(forKey: key),
              let decoded = try? JSONDecoder().decode(ScoreRecord.self, from: data) else {
            return .empty
        }
        records[game] = decoded
        return decoded
    }

    func saveScore(for game: GameID, score: Int) -> (record: ScoreRecord, isBest: Bool) {
        var current = load(game)
        let newBest = max(current.best, score)
        let isBest = score > current.best
        current = ScoreRecord(score: score, best: newBest, plays: current.plays + 1, lastPlayed: Date())
        records[game] = current

        let key = keyPrefix + game.rawValue
        if let data = try? JSONEncoder().encode(current) {
            defaults.set(data, forKey: key)
        }
        return (current, isBest)
    }

    private func loadAll() {
        GameID.allCases.forEach { game in
            records[game] = load(game)
        }
    }
}
