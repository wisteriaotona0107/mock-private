import SwiftUI
import SwiftData

struct StockLotFormView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Sake.name) private var sakes: [Sake]

    @State private var selectedSake: Sake?
    @State private var bottleSizeMl = "720"
    @State private var location = ""
    @State private var opened = false
    @State private var remainingMl = "720"

    @State private var showCreateSake = false
    @State private var errorMessage: String?

    var body: some View {
        Form {
            Section("銘柄") {
                if sakes.isEmpty {
                    Text("先に銘柄を作成してください。")
                } else {
                    Picker("銘柄", selection: $selectedSake) {
                        Text("選択してください").tag(Optional<Sake>.none)
                        ForEach(sakes) { sake in
                            Text(sake.name).tag(Optional(sake))
                        }
                    }
                }
                Button("銘柄を新規作成") {
                    showCreateSake = true
                }
            }

            Section("在庫情報") {
                TextField("容量(ml)", text: $bottleSizeMl)
                    .keyboardType(.numberPad)
                TextField("保管場所", text: $location)
                Toggle("開栓済み", isOn: $opened)
                TextField("残量(ml)", text: $remainingMl)
                    .keyboardType(.numberPad)
            }
        }
        .navigationTitle("在庫追加")
        .toolbar {
            ToolbarItem(placement: .cancellationAction) {
                Button("キャンセル") { dismiss() }
            }
            ToolbarItem(placement: .confirmationAction) {
                Button("保存") { saveLot() }
            }
        }
        .sheet(isPresented: $showCreateSake) {
            NavigationStack {
                SakeFormView()
            }
        }
        .onAppear {
            if selectedSake == nil { selectedSake = sakes.first }
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

    private func saveLot() {
        guard let selectedSake else {
            errorMessage = "銘柄を選択してください。"
            return
        }
        guard let size = Int(bottleSizeMl), let remaining = Int(remainingMl) else {
            errorMessage = "容量と残量は整数で入力してください。"
            return
        }

        do {
            try InventoryService.validateLot(bottleSizeMl: size, remainingMl: remaining)
            let lot = StockLot(
                sake: selectedSake,
                location: normalizedLocation,
                bottleSizeMl: size,
                opened: opened,
                remainingMl: remaining
            )
            modelContext.insert(lot)
            try modelContext.save()
            dismiss()
        } catch {
            errorMessage = error.localizedDescription
        }
    }

    private var normalizedLocation: String? {
        let trimmed = location.trimmingCharacters(in: .whitespacesAndNewlines)
        return trimmed.isEmpty ? nil : trimmed
    }
}
