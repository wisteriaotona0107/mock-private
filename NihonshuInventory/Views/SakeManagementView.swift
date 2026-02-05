import SwiftUI
import SwiftData

struct SakeManagementView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Sake.updatedAt, order: .reverse) private var sakes: [Sake]

    @State private var showCreate = false
    @State private var editingSake: Sake?
    @State private var errorMessage: String?

    var body: some View {
        List {
            if sakes.isEmpty {
                ContentUnavailableView(
                    "銘柄がありません",
                    systemImage: "wineglass",
                    description: Text("右上の追加ボタンから銘柄を登録してください。")
                )
            } else {
                ForEach(sakes) { sake in
                    Button {
                        editingSake = sake
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(sake.name)
                                .font(.headline)
                                .foregroundStyle(.primary)
                            Text("蔵元: \(sake.brewery ?? "未設定")")
                                .foregroundStyle(.secondary)
                            Text("更新: \(AppFormatters.dateTime.string(from: sake.updatedAt))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete(perform: deleteSake)
            }
        }
        .navigationTitle("銘柄管理")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showCreate = true
                } label: {
                    Label("追加", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showCreate) {
            NavigationStack {
                SakeFormView()
            }
        }
        .sheet(item: $editingSake) { sake in
            NavigationStack {
                SakeFormView(sake: sake)
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

    private func deleteSake(offsets: IndexSet) {
        for index in offsets {
            let target = sakes[index]
            guard InventoryService.canDeleteSake(target) else {
                errorMessage = InventoryError.sakeHasLots.localizedDescription
                return
            }
            modelContext.delete(target)
        }
    }
}
