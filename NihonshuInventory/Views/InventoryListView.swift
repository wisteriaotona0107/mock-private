import SwiftUI
import SwiftData

struct InventoryListView: View {
    enum SortMode: String, CaseIterable, Identifiable {
        case updatedDesc = "更新日↓"
        case sakeAsc = "銘柄A-Z"

        var id: String { rawValue }
    }

    @Environment(\.modelContext) private var modelContext
    @Query private var lots: [StockLot]

    @State private var searchText = ""
    @State private var selectedOpened: Bool?
    @State private var selectedLocation = "すべて"
    @State private var sortMode: SortMode = .updatedDesc
    @State private var showLotForm = false

    init() {
        _lots = Query(sort: [SortDescriptor(\StockLot.updatedAt, order: .reverse)])
    }

    private var locations: [String] {
        let values = lots.compactMap { $0.location?.trimmingCharacters(in: .whitespacesAndNewlines) }
            .filter { !$0.isEmpty }
        return ["すべて"] + Array(Set(values)).sorted()
    }

    private var filteredLots: [StockLot] {
        lots
            .filter { lot in
                if let opened = selectedOpened, lot.opened != opened { return false }
                if selectedLocation != "すべて", lot.location != selectedLocation { return false }
                if searchText.isEmpty { return true }
                let key = searchText.lowercased()
                return lot.sake.name.lowercased().contains(key)
                    || (lot.sake.brewery?.lowercased().contains(key) ?? false)
                    || (lot.location?.lowercased().contains(key) ?? false)
            }
            .sorted { lhs, rhs in
                switch sortMode {
                case .updatedDesc:
                    return lhs.updatedAt > rhs.updatedAt
                case .sakeAsc:
                    return lhs.sake.name.localizedStandardCompare(rhs.sake.name) == .orderedAscending
                }
            }
    }

    var body: some View {
        List {
            Section {
                Picker("開栓", selection: $selectedOpened) {
                    Text("すべて").tag(Optional<Bool>.none)
                    Text("未開栓").tag(Optional(false))
                    Text("開栓済み").tag(Optional(true))
                }
                .pickerStyle(.segmented)

                Picker("保管場所", selection: $selectedLocation) {
                    ForEach(locations, id: \.self) { location in
                        Text(location).tag(location)
                    }
                }

                Picker("並び順", selection: $sortMode) {
                    ForEach(SortMode.allCases) { mode in
                        Text(mode.rawValue).tag(mode)
                    }
                }
                .pickerStyle(.segmented)
            }

            if filteredLots.isEmpty {
                ContentUnavailableView(
                    "在庫がありません",
                    systemImage: "shippingbox",
                    description: Text("右上の追加ボタンから在庫を作成してください。")
                )
            } else {
                ForEach(filteredLots) { lot in
                    NavigationLink {
                        StockLotDetailView(lot: lot)
                    } label: {
                        VStack(alignment: .leading, spacing: 4) {
                            Text(lot.sake.name)
                                .font(.headline)
                            Text("場所: \(lot.location ?? "未設定")")
                            Text("残量: \(lot.remainingMl) / \(lot.bottleSizeMl) ml")
                            Text(lot.opened ? "開栓済み" : "未開栓")
                            Text("更新: \(AppFormatters.dateTime.string(from: lot.updatedAt))")
                                .font(.caption)
                                .foregroundStyle(.secondary)
                        }
                    }
                }
                .onDelete(perform: deleteLots)
            }
        }
        .navigationTitle("日本酒棚卸")
        .searchable(text: $searchText, prompt: "銘柄・蔵元・場所で検索")
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button {
                    showLotForm = true
                } label: {
                    Label("在庫追加", systemImage: "plus")
                }
            }
        }
        .sheet(isPresented: $showLotForm) {
            NavigationStack {
                StockLotFormView()
            }
        }
    }

    private func deleteLots(offsets: IndexSet) {
        for index in offsets {
            modelContext.delete(filteredLots[index])
        }
    }
}
