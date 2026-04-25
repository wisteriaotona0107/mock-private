import Foundation

protocol SessionStore {
    func load() throws -> [SessionRecord]
    func save(_ records: [SessionRecord]) throws
}

final class LocalSessionStore: SessionStore {
    private let fileManager: FileManager
    private let encoder = JSONEncoder()
    private let decoder = JSONDecoder()

    init(fileManager: FileManager = .default) {
        self.fileManager = fileManager
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601
        decoder.dateDecodingStrategy = .iso8601
    }

    func load() throws -> [SessionRecord] {
        let url = try dataURL()
        guard fileManager.fileExists(atPath: url.path) else {
            return sampleRecords()
        }

        let data = try Data(contentsOf: url)
        return try decoder.decode([SessionRecord].self, from: data)
    }

    func save(_ records: [SessionRecord]) throws {
        let url = try dataURL()
        let data = try encoder.encode(records)
        try data.write(to: url, options: .atomic)
    }

    private func dataURL() throws -> URL {
        let baseDir = try fileManager.url(
            for: .documentDirectory,
            in: .userDomainMask,
            appropriateFor: nil,
            create: true
        )
        return baseDir.appendingPathComponent("hanami_sessions.json")
    }

    private func sampleRecords() -> [SessionRecord] {
        [
            SessionRecord(
                id: UUID(),
                createdAt: .now,
                title: "名所・朝のテスト",
                parkType: .famous,
                timeSlot: .morning,
                participants: 6,
                sheetSize: .six,
                aiMemo: "AI提案: 朝のうちに中央やや左を確保。混雑回避優先。",
                mermaidText: "graph TD\nA[名所を選択]-->B[朝に配置]-->C[混雑率を確認]",
                score: .init(blossom: 4.5, space: 5.0, congestion: 2.8)
            )
        ]
    }
}
