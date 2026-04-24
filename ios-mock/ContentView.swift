import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: RouteStore
    @State private var exportText = ""

    private var columns: [GridItem] {
        Array(repeating: GridItem(.flexible(), spacing: 8), count: store.state.columns)
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    configCard
                    gridCard
                    statusCard
                    historyCard
                    aiPasteCard
                    exportCard
                }
                .padding(16)
            }
            .navigationTitle("Route Mock (Local)")
        }
    }

    private var configCard: some View {
        GroupBox("グリッド設定") {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Stepper("行: \(store.state.rows)", value: $store.state.rows, in: 1...20)
                    Stepper("列: \(store.state.columns)", value: $store.state.columns, in: 1...20)
                }

                Stepper("経路数: \(store.state.routeCount)", value: $store.state.routeCount, in: 1...400)

                Text("マス数(行×列)を超える経路数は自動で調整されます。")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                Button("設定を反映") {
                    store.applyGridConfig()
                }
                .buttonStyle(.borderedProminent)
            }
        }
    }

    private var gridCard: some View {
        GroupBox("経路グリッド") {
            LazyVGrid(columns: columns, spacing: 8) {
                ForEach(0..<store.state.totalCells, id: \.self) { index in
                    cellView(index: index)
                }
            }
        }
    }

    @ViewBuilder
    private func cellView(index: Int) -> some View {
        if index < store.state.routeList.count {
            let number = store.state.routeList[index]
            let isCurrent = store.state.currentIndex == index
            let isPassed = store.state.passedRoutes.contains(number)

            Button {
                store.tapCell(at: index)
            } label: {
                Text("\(number)")
                    .fontWeight(.semibold)
                    .frame(maxWidth: .infinity, minHeight: 50)
            }
            .buttonStyle(.plain)
            .background(isCurrent ? Color.green.opacity(0.35) : (isPassed ? Color.blue.opacity(0.2) : Color.gray.opacity(0.12)))
            .clipShape(RoundedRectangle(cornerRadius: 10))
        } else {
            Text("×")
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, minHeight: 50)
                .background(Color.gray.opacity(0.08))
                .clipShape(RoundedRectangle(cornerRadius: 10))
                .overlay(
                    RoundedRectangle(cornerRadius: 10)
                        .stroke(Color.gray.opacity(0.2), lineWidth: 1)
                )
        }
    }

    private var statusCard: some View {
        GroupBox("現在位置") {
            VStack(alignment: .leading, spacing: 8) {
                if let index = store.state.currentIndex {
                    Text("現在の経路番号: \(store.state.routeList[index])")
                        .font(.headline)
                } else {
                    Text("未選択（初期地点をタップしてください）")
                        .font(.headline)
                }

                Button("リセット") {
                    store.resetRoute()
                }
                .buttonStyle(.bordered)
            }
        }
    }

    private var historyCard: some View {
        GroupBox("通過履歴") {
            let lines = store.state.passedRoutes.enumerated().map { "route[\($0.offset)] = \($0.element)" }
            Text(lines.isEmpty ? "まだ通過履歴はありません" : lines.joined(separator: "\n"))
                .frame(maxWidth: .infinity, alignment: .leading)
                .font(.system(.body, design: .monospaced))
        }
    }

    private var aiPasteCard: some View {
        GroupBox("AI出力（貼り付け欄）") {
            VStack(alignment: .leading, spacing: 8) {
                Text("AI API連携は後回しにし、ここへ結果を貼り付ける想定。")
                    .font(.footnote)
                    .foregroundStyle(.secondary)

                TextEditor(text: $store.state.aiOutputDraft)
                    .frame(minHeight: 120)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.gray.opacity(0.25), lineWidth: 1)
                    )
            }
        }
    }

    private var exportCard: some View {
        GroupBox("エクスポート想定 (CSV / Markdown / Mermaidテキスト)") {
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Button("CSV生成") {
                        exportText = store.exportBundle().csv
                    }
                    .buttonStyle(.bordered)

                    Button("Markdown生成") {
                        exportText = store.exportBundle().markdown
                    }
                    .buttonStyle(.bordered)

                    Button("Mermaid文字列生成") {
                        exportText = store.exportBundle().mermaidText
                    }
                    .buttonStyle(.bordered)
                }

                TextEditor(text: .constant(exportText))
                    .frame(minHeight: 140)
                    .overlay(
                        RoundedRectangle(cornerRadius: 8)
                            .stroke(Color.gray.opacity(0.25), lineWidth: 1)
                    )
            }
        }
    }
}
