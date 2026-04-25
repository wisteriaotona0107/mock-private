import Foundation
import Combine
#if canImport(UIKit)
import UIKit
#endif

@MainActor
final class HanamiGameViewModel: ObservableObject {
    @Published var records: [SessionRecord] = []
    @Published var draft: SessionRecord = .empty
    @Published var statusMessage = "ローカルモックモード（通信なし）"

    private let store: SessionStore

    init(store: SessionStore) {
        self.store = store
        load()
    }

    func load() {
        do {
            records = try store.load().sorted { $0.createdAt > $1.createdAt }
            statusMessage = "保存データを読み込みました。"
        } catch {
            statusMessage = "読み込み失敗: \(error.localizedDescription)"
        }
    }

    func resetDraft() {
        draft = .empty
        statusMessage = "入力フォームを初期化しました。"
    }

    func applyQuickScore() {
        let blossom = estimateBlossomScore(park: draft.parkType, slot: draft.timeSlot)
        let space = estimateSpaceScore(participants: draft.participants, sheet: draft.sheetSize)
        let congestion = estimateCongestionScore(park: draft.parkType, slot: draft.timeSlot)
        draft.score = .init(blossom: blossom, space: space, congestion: congestion)
        statusMessage = "簡易スコアを再計算しました。"
    }

    func saveDraft() {
        var item = draft
        item.id = UUID()
        item.createdAt = .now
        records.insert(item, at: 0)
        persist()
        statusMessage = "ローカルに保存しました。"
    }

    func delete(_ record: SessionRecord) {
        records.removeAll { $0.id == record.id }
        persist()
        statusMessage = "1件削除しました。"
    }

    func exportCSV() -> String {
        let header = "title,createdAt,parkType,timeSlot,participants,sheetSize,totalScore"
        let body = records.map {
            "\($0.title),\(iso($0.createdAt)),\($0.parkType.rawValue),\($0.timeSlot.rawValue),\($0.participants),\($0.sheetSize.rawValue),\($0.score.total100)"
        }.joined(separator: "\n")
        return [header, body].joined(separator: "\n")
    }

    func exportMarkdown() -> String {
        let rows = records.map {
            "| \($0.title) | \($0.parkType.rawValue) | \($0.timeSlot.rawValue) | \($0.participants) | \($0.sheetSize.rawValue) | \($0.score.total100) |"
        }.joined(separator: "\n")
        return """
        # 花見席取りログ

        | タイトル | 公園 | 時間帯 | 人数 | シート | スコア |
        |---|---|---:|---:|---|---:|
        \(rows)
        """
    }

    func exportMermaid() -> String {
        let lines = records.prefix(12).enumerated().map { idx, r in
            "N\(idx)[\(r.title) \(r.score.total100)点]"
        }
        let links = (0..<(max(lines.count - 1, 0))).map { "N\($0)-->N\($0 + 1)" }
        return (["graph TD"] + lines + links).joined(separator: "\n")
    }

    func copyToPasteboard(_ text: String) {
        #if canImport(UIKit)
        UIPasteboard.general.string = text
        statusMessage = "クリップボードへコピーしました。"
        #else
        statusMessage = "この環境ではクリップボード連携不可。"
        #endif
    }

    private func persist() {
        do {
            try store.save(records)
        } catch {
            statusMessage = "保存失敗: \(error.localizedDescription)"
        }
    }

    private func estimateBlossomScore(park: ParkType, slot: TimeSlot) -> Double {
        let base: Double
        switch park {
        case .small: base = 3.6
        case .medium: base = 3.8
        case .famous: base = 4.4
        }
        let timeBoost: Double = slot == .morning ? 0.3 : slot == .noon ? 0.1 : 0.15
        return clamp(base + timeBoost, min: 1, max: 5)
    }

    private func estimateSpaceScore(participants: Int, sheet: SheetSize) -> Double {
        let diff = participants - sheet.capacity
        switch diff {
        case ...(-4): return 2.8
        case -3...(-1): return 3.5
        case 0: return 5.0
        case 1...2: return 3.0
        case 3...4: return 2.0
        default: return 1.0
        }
    }

    private func estimateCongestionScore(park: ParkType, slot: TimeSlot) -> Double {
        let idx = TimeSlot.allCases.firstIndex(of: slot) ?? 0
        let rate = park.congestionBase[idx]
        return clamp(5.0 - rate * 4.2, min: 1, max: 5)
    }

    private func iso(_ date: Date) -> String {
        let formatter = ISO8601DateFormatter()
        return formatter.string(from: date)
    }

    private func clamp(_ value: Double, min: Double, max: Double) -> Double {
        Swift.max(min, Swift.min(max, value))
    }
}
