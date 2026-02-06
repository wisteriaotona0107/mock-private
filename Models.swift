import Foundation

enum Role: String, CaseIterable, Codable, Identifiable {
    case developer
    case readonly
    case admin

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .developer: "Developer"
        case .readonly: "Read Only"
        case .admin: "Admin"
        }
    }
}

struct AccessContext: Codable, Equatable {
    var role: Role
    var editLock: Bool

    var canEdit: Bool {
        !editLock && role != .readonly
    }
}

struct HistoryRecord: Identifiable, Codable, Hashable {
    var id: UUID
    var title: String
    var notes: String
    var amount: Double
    var createdAt: Date
    var updatedAt: Date

    init(id: UUID = UUID(), title: String, notes: String, amount: Double, createdAt: Date = .now, updatedAt: Date = .now) {
        self.id = id
        self.title = title
        self.notes = notes
        self.amount = amount
        self.createdAt = createdAt
        self.updatedAt = updatedAt
    }
}

struct HistoryDraft {
    var title: String = ""
    var notes: String = ""
    var amount: Double = 0

    var canSubmit: Bool {
        !title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    func buildRecord() -> HistoryRecord {
        HistoryRecord(title: title, notes: notes, amount: amount)
    }
}

struct DebugConfig: Codable, Equatable {
    var simulateError: Bool = false
    var simulateDelay: Bool = false
    var delayMilliseconds: Int = 700
}

struct LogEntry: Identifiable, Codable {
    var id: UUID = UUID()
    var timestamp: Date = .now
    var level: String
    var message: String
}

enum AppError: LocalizedError {
    case updateForbidden
    case simulated
    case notFound

    var errorDescription: String? {
        switch self {
        case .updateForbidden: "現在のRBAC設定では更新できません。"
        case .simulated: "Debugの疑似エラーが有効です。"
        case .notFound: "対象の履歴が見つかりません。"
        }
    }
}
