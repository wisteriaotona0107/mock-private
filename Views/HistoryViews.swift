import SwiftUI

struct HistoryListView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        List(selection: $viewModel.selectedRecordID) {
            ForEach(viewModel.records) { record in
                NavigationLink(value: record.id) {
                    VStack(alignment: .leading) {
                        Text(record.title).font(.headline)
                        Text(record.updatedAt, style: .date).font(.caption)
                    }
                }
            }
        }
        .navigationTitle("History")
        .toolbar {
            Button(role: .destructive) {
                Task { await viewModel.deleteSelected() }
            } label: {
                Label("Delete", systemImage: "trash")
            }
        }
        .navigationDestination(for: UUID.self) { id in
            if let record = viewModel.records.first(where: { $0.id == id }) {
                HistoryDetailView(viewModel: viewModel, record: record)
            } else {
                Text("Not found")
            }
        }
    }
}

struct HistoryDetailView: View {
    @ObservedObject var viewModel: AppViewModel
    let record: HistoryRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(record.title).font(.title2).bold()
            Text(record.notes)
            Text("金額: \(record.amount.formatted())")
            Text("作成: \(record.createdAt.formatted(date: .abbreviated, time: .shortened))")
            Text("更新: \(record.updatedAt.formatted(date: .abbreviated, time: .shortened))")
            NavigationLink("編集") {
                HistoryEditView(viewModel: viewModel, record: record)
            }
            .buttonStyle(.borderedProminent)
            Spacer()
        }
        .padding()
        .navigationTitle("Detail")
    }
}

struct HistoryEditView: View {
    @ObservedObject var viewModel: AppViewModel
    @EnvironmentObject private var settings: SettingsStore
    @Environment(\.dismiss) private var dismiss

    @State private var title: String
    @State private var notes: String
    @State private var amount: Double

    private let baseRecord: HistoryRecord

    init(viewModel: AppViewModel, record: HistoryRecord) {
        self.viewModel = viewModel
        self.baseRecord = record
        _title = State(initialValue: record.title)
        _notes = State(initialValue: record.notes)
        _amount = State(initialValue: record.amount)
    }

    var body: some View {
        Form {
            Section("編集") {
                TextField("タイトル", text: $title)
                TextField("メモ", text: $notes)
                TextField("金額", value: $amount, format: .number)
            }

            Section {
                Button("更新") {
                    let updated = HistoryRecord(
                        id: baseRecord.id,
                        title: title,
                        notes: notes,
                        amount: amount,
                        createdAt: baseRecord.createdAt,
                        updatedAt: .now
                    )
                    Task {
                        await viewModel.update(record: updated)
                        dismiss()
                    }
                }
                .disabled(!settings.accessContext.canEdit)
            }

            if !settings.accessContext.canEdit {
                Text("RBAC / editLock により更新が禁止されています。")
                    .foregroundStyle(.red)
            }
        }
        .navigationTitle("Edit")
    }
}
