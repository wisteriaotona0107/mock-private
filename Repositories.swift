import Foundation

actor HistoryRepository {
    private struct Storage: Codable {
        var records: [HistoryRecord]
    }

    private let fileName = "history.json"
    private let backupFileName = "history.backup.json"

    private var debugConfig = DebugConfig()
    private var records: [HistoryRecord] = []
    private let encoder: JSONEncoder
    private let decoder: JSONDecoder

    init() {
        encoder = JSONEncoder()
        encoder.outputFormatting = [.prettyPrinted, .sortedKeys]
        encoder.dateEncodingStrategy = .iso8601

        decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
    }

    func setDebugConfig(_ config: DebugConfig) {
        debugConfig = config
    }

    func load() async throws -> [HistoryRecord] {
        try await applyDebugBehaviors()
        if let data = try readData(fileName: fileName) {
            records = try decodeRecords(data)
            return records.sorted { $0.createdAt > $1.createdAt }
        }

        if let backupData = try readData(fileName: backupFileName) {
            records = try decodeRecords(backupData)
            try persistCurrentState()
            return records.sorted { $0.createdAt > $1.createdAt }
        }

        records = []
        return []
    }

    func add(_ record: HistoryRecord, access: AccessContext) async throws -> [HistoryRecord] {
        try ensureWritable(access)
        try await applyDebugBehaviors()
        records.insert(record, at: 0)
        try persistCurrentState()
        return records
    }

    func update(_ record: HistoryRecord, access: AccessContext) async throws -> [HistoryRecord] {
        try ensureWritable(access)
        try await applyDebugBehaviors()
        guard let index = records.firstIndex(where: { $0.id == record.id }) else {
            throw AppError.notFound
        }
        var updated = record
        updated.updatedAt = .now
        records[index] = updated
        try persistCurrentState()
        return records
    }

    func delete(id: UUID, access: AccessContext) async throws -> [HistoryRecord] {
        try ensureWritable(access)
        try await applyDebugBehaviors()
        records.removeAll { $0.id == id }
        try persistCurrentState()
        return records
    }

    private func ensureWritable(_ access: AccessContext) throws {
        guard access.canEdit else { throw AppError.updateForbidden }
    }

    private func applyDebugBehaviors() async throws {
        if debugConfig.simulateDelay {
            let ns = UInt64(max(0, debugConfig.delayMilliseconds)) * 1_000_000
            try await Task.sleep(nanoseconds: ns)
        }
        if debugConfig.simulateError {
            throw AppError.simulated
        }
    }

    private func decodeRecords(_ data: Data) throws -> [HistoryRecord] {
        let storage = try decoder.decode(Storage.self, from: data)
        return storage.records
    }

    private func persistCurrentState() throws {
        let data = try encoder.encode(Storage(records: records))
        let mainURL = try fileURL(fileName)
        let backupURL = try fileURL(backupFileName)

        if FileManager.default.fileExists(atPath: mainURL.path) {
            if FileManager.default.fileExists(atPath: backupURL.path) {
                try FileManager.default.removeItem(at: backupURL)
            }
            try FileManager.default.copyItem(at: mainURL, to: backupURL)
        }

        try data.write(to: mainURL, options: [.atomic])
    }

    private func fileURL(_ name: String) throws -> URL {
        guard let dir = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first else {
            throw CocoaError(.fileNoSuchFile)
        }
        return dir.appendingPathComponent(name)
    }

    private func readData(fileName: String) throws -> Data? {
        let url = try fileURL(fileName)
        guard FileManager.default.fileExists(atPath: url.path) else { return nil }
        return try Data(contentsOf: url)
    }
}

actor LogStore {
    private(set) var entries: [LogEntry] = []
    private let maxCount = 500

    func push(level: String = "INFO", _ message: String) {
        entries.append(LogEntry(level: level, message: message))
        if entries.count > maxCount {
            entries.removeFirst(entries.count - maxCount)
        }
    }

    func list() -> [LogEntry] {
        entries.sorted { $0.timestamp > $1.timestamp }
    }
}
