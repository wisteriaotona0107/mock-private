import SwiftUI
import SwiftData

struct SakeFormView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Sake.name) private var allSakes: [Sake]

    let sake: Sake?

    @State private var name = ""
    @State private var brewery = ""
    @State private var type = ""
    @State private var memo = ""
    @State private var errorMessage: String?

    init(sake: Sake? = nil) {
        self.sake = sake
        _name = State(initialValue: sake?.name ?? "")
        _brewery = State(initialValue: sake?.brewery ?? "")
        _type = State(initialValue: sake?.type ?? "")
        _memo = State(initialValue: sake?.memo ?? "")
    }

    var body: some View {
        Form {
            Section("基本情報") {
                TextField("銘柄名（必須）", text: $name)
                TextField("蔵元", text: $brewery)
                TextField("タイプ", text: $type)
                TextField("メモ", text: $memo, axis: .vertical)
                    .lineLimit(3...6)
            }
        }
        .navigationTitle(sake == nil ? "銘柄追加" : "銘柄編集")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("キャンセル") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("保存") { saveSake() }
            }
        }
        .alert("エラー", isPresented: Binding(
            get: { errorMessage != nil },
            set: { _ in errorMessage = nil }
        )) {
            Button("OK", role: .cancel) {}
        } message: {
            Text(errorMessage ?? "")
        }
    }

    private func saveSake() {
        let trimmedName = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let allNames = allSakes.map(\.name)

        do {
            try InventoryService.validateSakeName(trimmedName, existingNames: allNames, currentName: sake?.name)

            if let sake {
                sake.name = trimmedName
                sake.brewery = normalizedOrNil(brewery)
                sake.type = normalizedOrNil(type)
                sake.memo = normalizedOrNil(memo)
                sake.updatedAt = .now
            } else {
                let newSake = Sake(
                    name: trimmedName,
                    brewery: normalizedOrNil(brewery),
                    type: normalizedOrNil(type),
                    memo: normalizedOrNil(memo)
                )
                modelContext.insert(newSake)
            }

            try modelContext.save()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private func normalizedOrNil(_ text: String) -> String? {
        let trimmed = text.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
