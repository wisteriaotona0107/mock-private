import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var vm: HanamiGameViewModel

    var body: some View {
        NavigationStack {
            List {
                Section("入力（AI出力貼り付け対応）") {
                    TextField("タイトル", text: $vm.draft.title)

                    Picker("公園タイプ", selection: $vm.draft.parkType) {
                        ForEach(ParkType.allCases) { park in
                            Text(park.rawValue).tag(park)
                        }
                    }

                    Picker("時間帯", selection: $vm.draft.timeSlot) {
                        ForEach(TimeSlot.allCases) { slot in
                            Text(slot.rawValue).tag(slot)
                        }
                    }

                    Picker("人数", selection: $vm.draft.participants) {
                        ForEach([2, 4, 6, 8], id: \.self) { n in
                            Text("\(n)人").tag(n)
                        }
                    }

                    Picker("シート", selection: $vm.draft.sheetSize) {
                        ForEach(SheetSize.allCases) { size in
                            Text(size.rawValue).tag(size)
                        }
                    }

                    VStack(alignment: .leading) {
                        Text("AIメモ（任意）")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        TextEditor(text: $vm.draft.aiMemo)
                            .frame(minHeight: 80)
                    }

                    VStack(alignment: .leading) {
                        Text("Mermaid（まずはテキスト表示）")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        TextEditor(text: $vm.draft.mermaidText)
                            .font(.system(.footnote, design: .monospaced))
                            .frame(minHeight: 100)
                    }

                    HStack {
                        Button("スコア再計算") { vm.applyQuickScore() }
                        Button("保存") { vm.saveDraft() }
                        Button("リセット", role: .destructive) { vm.resetDraft() }
                    }

                    ScoreSummaryView(score: vm.draft.score)
                }

                Section("エクスポート（将来連携用）") {
                    ExportRow(
                        label: "CSVをコピー",
                        preview: vm.exportCSV(),
                        copyAction: vm.copyToPasteboard
                    )
                    ExportRow(
                        label: "Markdownをコピー",
                        preview: vm.exportMarkdown(),
                        copyAction: vm.copyToPasteboard
                    )
                    ExportRow(
                        label: "Mermaidをコピー",
                        preview: vm.exportMermaid(),
                        copyAction: vm.copyToPasteboard
                    )
                }

                Section("保存済みログ") {
                    if vm.records.isEmpty {
                        Text("ログはまだありません。")
                            .foregroundStyle(.secondary)
                    }

                    ForEach(vm.records) { record in
                        VStack(alignment: .leading, spacing: 6) {
                            Text(record.title).font(.headline)
                            Text("\(record.parkType.rawValue) / \(record.timeSlot.rawValue) / \(record.participants)人 / \(record.sheetSize.rawValue)")
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            Text("総合スコア: \(record.score.total100)点")
                                .fontWeight(.semibold)
                        }
                        .swipeActions {
                            Button(role: .destructive) {
                                vm.delete(record)
                            } label: {
                                Label("削除", systemImage: "trash")
                            }
                        }
                    }
                }
            }
            .navigationTitle("花見席取りモック")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("再読込") { vm.load() }
                }
            }
            .safeAreaInset(edge: .bottom) {
                Text(vm.statusMessage)
                    .font(.footnote)
                    .frame(maxWidth: .infinity)
                    .padding(8)
                    .background(.thinMaterial)
            }
        }
    }
}

private struct ScoreSummaryView: View {
    let score: ScoreBreakdown

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("スコア")
                .font(.headline)
            Text("桜満足度: \(score.blossom, specifier: "%.2f")")
            Text("広さ満足度: \(score.space, specifier: "%.2f")")
            Text("混雑満足度: \(score.congestion, specifier: "%.2f")")
            Text("総合: \(score.total, specifier: "%.2f") / 5（\(score.total100)点）")
                .fontWeight(.semibold)
        }
    }
}

private struct ExportRow: View {
    let label: String
    let preview: String
    let copyAction: (String) -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Button(label) {
                copyAction(preview)
            }
            .buttonStyle(.borderedProminent)

            Text(preview)
                .font(.system(.caption, design: .monospaced))
                .foregroundStyle(.secondary)
                .lineLimit(5)
        }
    }
}
