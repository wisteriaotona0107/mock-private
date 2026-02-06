import SwiftUI

struct HomeView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        GeometryReader { proxy in
            let twoColumns = proxy.size.width > 700
            ScrollView {
                if twoColumns {
                    HStack(alignment: .top, spacing: 16) {
                        formSection
                            .frame(maxWidth: .infinity)
                        previewSection
                            .frame(maxWidth: .infinity)
                    }
                    .padding()
                } else {
                    VStack(spacing: 16) {
                        formSection
                        previewSection
                    }
                    .padding()
                }
            }
            .navigationTitle("Home")
        }
    }

    private var formSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("入力フォーム").font(.headline)
            TextField("タイトル", text: $viewModel.homeDraft.title)
                .textFieldStyle(.roundedBorder)
            TextField("メモ", text: $viewModel.homeDraft.notes, axis: .vertical)
                .textFieldStyle(.roundedBorder)
                .lineLimit(3, reservesSpace: true)
            HStack {
                Text("金額")
                TextField("0", value: $viewModel.homeDraft.amount, format: .number)
                    .keyboardType(.decimalPad)
                    .textFieldStyle(.roundedBorder)
            }
            Button("保存") {
                Task { await viewModel.createFromDraft() }
            }
            .buttonStyle(.borderedProminent)
            .disabled(!viewModel.homeDraft.canSubmit)

            if let message = viewModel.latestErrorMessage {
                Text(message)
                    .foregroundStyle(.red)
                    .font(.caption)
            }
        }
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }

    private var previewSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("プレビュー").font(.headline)
            Text("タイトル: \(viewModel.homeDraft.title)")
            Text("メモ: \(viewModel.homeDraft.notes)")
            Text("金額: \(viewModel.homeDraft.amount.formatted())")
            Divider()
            Text("現在件数: \(viewModel.records.count)")
                .font(.caption)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(.thinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}
