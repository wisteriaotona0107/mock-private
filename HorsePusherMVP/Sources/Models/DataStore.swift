import Foundation

final class DataStore {
    static let shared = DataStore()

    private let coinsKey = "coins"
    private let bestPayoutKey = "bestPayout"
    private let userDefaults = UserDefaults.standard

    private init() {}

    func loadCoins(defaultValue: Int) -> Int {
        let value = userDefaults.integer(forKey: coinsKey)
        return value == 0 ? defaultValue : value
    }

    func saveCoins(_ value: Int) {
        userDefaults.set(value, forKey: coinsKey)
    }

    func loadBestPayout() -> Int {
        userDefaults.integer(forKey: bestPayoutKey)
    }

    func saveBestPayout(_ value: Int) {
        userDefaults.set(value, forKey: bestPayoutKey)
    }
}

enum JSONLoader {
    static func load<T: Decodable>(_ filename: String) -> T {
        guard let url = Bundle.main.url(forResource: filename, withExtension: nil) else {
            fatalError("Missing \(filename) in bundle.")
        }
        guard let data = try? Data(contentsOf: url) else {
            fatalError("Unable to load \(filename).")
        }
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        guard let decoded = try? decoder.decode(T.self, from: data) else {
            fatalError("Unable to decode \(filename).")
        }
        return decoded
    }
}
