import SwiftUI
import SwiftData

struct StockLotDetailView: View {
    enum ActionKind: String, CaseIterable, Identifiable {
        case `in` = "入庫"
        case out = "提供"
        case adjust = "棚卸調整"

        var id: String { rawValue }
    }

    @Environment(\.modelContext) private var modelContext
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @State private var amount = ""
    @State private var note = ""
    @State private var actionKind: ActionKind = .out
    @State private var errorMessage: String?

    let lot: StockLot
    let namespace: Namespace.ID?

    private var sortedEvents: [StockEvent] {
        lot.events.sorted { $0.at > $1.at }
    }

    var body: some View {
        ZStack {
            WashiBackground()

            ScrollView {
                VStack(spacing: Theme.Spacing.md) {
                    CardContainer {
                        VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                            titleView
                            Divider()
                                .overlay(Theme.DividerStyle.color)
                            LabeledContent("場所", value: lot.location ?? "未設定")
                            LabeledContent("状態", value: lot.opened ? "開栓済み" : "未開栓")
                            LabeledContent("容量", value: "\(lot.bottleSizeMl)ml")
                            LabeledContent("残量", value: "\(lot.remainingMl)ml")
                            LabeledContent("更新", value: AppFormatters.dateTime.string(from: lot.updatedAt))
                        }
                        .font(Theme.Typography.body)
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                            Text("在庫操作")
                                .font(Theme.Typography.headline)
                                .foregroundStyle(Theme.Colors.ink)
                            Picker("操作", selection: $actionKind) {
                                ForEach(ActionKind.allCases) { kind in
                                    Text(kind.rawValue).tag(kind)
                                }
                            }

                            TextField(actionKind == .adjust ? "調整後残量(ml)" : "数量(ml)", text: $amount)
                                .keyboardType(.numberPad)
                                .textFieldStyle(.roundedBorder)

                            TextField("メモ", text: $note)
                                .textFieldStyle(.roundedBorder)

                            PrimaryButton(title: "実行") {
                                applyAction()
                            }
                        }
                    }

                    CardContainer {
                        VStack(alignment: .leading, spacing: Theme.Spacing.sm) {
                            Text("履歴")
                                .font(Theme.Typography.headline)
                                .foregroundStyle(Theme.Colors.ink)

                            if sortedEvents.isEmpty {
                                Text("履歴はまだありません。")
                                    .foregroundStyle(.secondary)
                            } else {
                                ForEach(sortedEvents) { event in
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("\(event.kind) \(event.deltaMl >= 0 ? "+" : "")\(event.deltaMl)ml")
                                            .font(Theme.Typography.headline)
                                        if let note = event.note, !note.isEmpty {
                                            Text(note)
                                                .font(Theme.Typography.body)
                                        }
                                        Text(AppFormatters.dateTime.string(from: event.at))
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    .padding(.vertical, Theme.Spacing.xs)
                                    if event.id != sortedEvents.last?.id {
                                        Divider()
                                            .overlay(Theme.DividerStyle.color)
                                    }
                                }
                            }
                        }
                    }
                }
                .padding(Theme.Spacing.md)
            }
            .scrollIndicators(.hidden)
        }
        .navigationTitle("在庫詳細")
        .animation(Motion.emphasizedSpring(reduceMotion: reduceMotion), value: lot.remainingMl)
        .alert("エラー", isPresented: Binding(
            get: { errorMessage != nil },
            set: { _ in errorMessage = nil }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    @ViewBuilder
    private var titleView: some View {
        if let namespace {
            Text(lot.sake.name)
                .font(Theme.Typography.title)
                .foregroundStyle(Theme.Colors.ink)
                .matchedGeometryEffect(id: "title-\(lot.id)", in: namespace)
        } else {
            Text(lot.sake.name)
                .font(Theme.Typography.title)
                .foregroundStyle(Theme.Colors.ink)
        }
    }

    private func applyAction() {
        guard let value = Int(amount), value >= 0 else {
            errorMessage = "数量は0以上の整数で入力してください。"
            return
        }

        do {
            switch actionKind {
            case .in:
                try InventoryService.applyIn(lot: lot, amountMl: value, note: noteOrNil)
            case .out:
                try InventoryService.applyOut(lot: lot, amountMl: value, note: noteOrNil)
            case .adjust:
                try InventoryService.applyAdjust(lot: lot, to: value, note: noteOrNil)
            }
            try modelContext.save()
            amount = ""
            note = ""
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private var noteOrNil: String? {
        let trimmed = note.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
