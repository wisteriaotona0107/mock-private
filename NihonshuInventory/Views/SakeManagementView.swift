import SwiftUI
import SwiftData

struct SakeManagementView: View {
    @Environment(\.modelContext) private var modelContext
    @Environment(\.accessibilityReduceMotion) private var reduceMotion
    @Query(sort: \Sake.updatedAt, order: .reverse) private var sakes: [Sake]

    @State private var showCreate = false
    @State private var editingSake: Sake?
    @State private var errorMessage: String?

    var body: some View {
        ZStack {
            WashiBackground()

            List {
                if sakes.isEmpty {
                    EmptyStateView(
                        title: "銘柄がありません",
                        message: "右上の追加ボタンから銘柄を登録してください。",
                        systemImage: "wineglass",
                        actionTitle: "銘柄を追加",
                        action: { showCreate = true }
                    )
                    .listRowSeparator(.hidden)
                } else {
                    ForEach(sakes) { sake in
                        Button {
                            editingSake = sake
                        } label: {
                            CardContainer {
                                VStack(alignment: .leading, spacing: Theme.Spacing.xs) {
                                    Text(sake.name)
                                        .font(Theme.Typography.headline)
                                        .foregroundStyle(Theme.Colors.ink)
                                    Text("蔵元: \(sake.brewery ?? "未設定")")
                                        .font(Theme.Typography.body)
                                        .foregroundStyle(.secondary)
                                    Text("更新: \(AppFormatters.dateTime.string(from: sake.updatedAt))")
                                        .font(.caption)
                                        .foregroundStyle(.secondary)
                                }
                            }
                        }
                        .listRowSeparator(.hidden)
                        .listRowBackground(Color.clear)
                        .transition(Motion.fadeScale(reduceMotion: reduceMotion).combined(with: .move(edge: .bottom)))
                    }
                    .onDelete(perform: deleteSake)
                }
            }
            .listStyle(.plain)
            .scrollContentBackground(.hidden)
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
        .animation(Motion.emphasizedSpring(reduceMotion: reduceMotion), value: sakes.count)
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
