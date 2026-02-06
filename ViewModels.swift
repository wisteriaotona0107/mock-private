import Foundation
import SwiftUI

@MainActor
final class SettingsStore: ObservableObject {
    @AppStorage("settings.role") var roleRawValue: String = Role.developer.rawValue
    @AppStorage("settings.editLock") var editLock: Bool = false

    @AppStorage("debug.simulateError") var simulateError: Bool = false
    @AppStorage("debug.simulateDelay") var simulateDelay: Bool = false
    @AppStorage("debug.delayMS") var delayMS: Int = 700

    var role: Role {
        get { Role(rawValue: roleRawValue) ?? .developer }
        set { roleRawValue = newValue.rawValue }
    }

    var accessContext: AccessContext {
        AccessContext(role: role, editLock: editLock)
    }

    var debugConfig: DebugConfig {
        DebugConfig(simulateError: simulateError, simulateDelay: simulateDelay, delayMilliseconds: delayMS)
    }
}

@MainActor
final class AppViewModel: ObservableObject {
    @Published var records: [HistoryRecord] = []
    @Published var selectedRecordID: UUID?
    @Published var homeDraft = HistoryDraft()
    @Published var latestErrorMessage: String?
    @Published var logs: [LogEntry] = []

    let settings: SettingsStore

    private let repository: HistoryRepository
    private let logger: LogStore

    init(repository: HistoryRepository, logger: LogStore, settings: SettingsStore) {
        self.repository = repository
        self.logger = logger
        self.settings = settings
    }

    func initialize() async {
        await syncDebugConfig()
        await loadRecords()
    }

    func syncDebugConfig() async {
        await repository.setDebugConfig(settings.debugConfig)
        await logger.push("DEBUG", "DebugConfig updated: error=\(settings.simulateError), delay=\(settings.simulateDelay), ms=\(settings.delayMS)")
        await refreshLogs()
    }

    func loadRecords() async {
        do {
            records = try await repository.load()
            await logger.push("INFO", "Loaded records: \(records.count)")
            await refreshLogs()
            if selectedRecord == nil {
                selectedRecordID = records.first?.id
            }
        } catch {
            await present(error)
        }
    }

    var selectedRecord: HistoryRecord? {
        records.first { $0.id == selectedRecordID }
    }

    func createFromDraft() async {
        guard homeDraft.canSubmit else { return }
        do {
            let created = homeDraft.buildRecord()
            records = try await repository.add(created, access: settings.accessContext)
            selectedRecordID = created.id
            homeDraft = HistoryDraft()
            await logger.push("INFO", "Created record: \(created.id)")
            await refreshLogs()
        } catch {
            await present(error)
        }
    }

    func update(record: HistoryRecord) async {
        do {
            records = try await repository.update(record, access: settings.accessContext)
            await logger.push("INFO", "Updated record: \(record.id)")
            await refreshLogs()
        } catch {
            await present(error)
        }
    }

    func deleteSelected() async {
        guard let id = selectedRecordID else { return }
        do {
            records = try await repository.delete(id: id, access: settings.accessContext)
            selectedRecordID = records.first?.id
            await logger.push("INFO", "Deleted record: \(id)")
            await refreshLogs()
        } catch {
            await present(error)
        }
    }

    func refreshLogs() async {
        logs = await logger.list()
    }

    private func present(_ error: Error) async {
        latestErrorMessage = error.localizedDescription
        await logger.push("ERROR", error.localizedDescription)
        await refreshLogs()
    }
}
