import SwiftUI

struct BetPanel: View {
    @EnvironmentObject private var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Bet")
                .font(.headline)
            Picker("Horse", selection: Binding(
                get: { viewModel.selectedHorse?.id ?? viewModel.horses.first?.id ?? 0 },
                set: { selectedId in
                    if let horse = viewModel.horses.first(where: { $0.id == selectedId }) {
                        viewModel.selectHorse(horse)
                    }
                }
            )) {
                ForEach(viewModel.horses) { horse in
                    Text("\(horse.number). \(horse.name)").tag(horse.id)
                }
            }
            .pickerStyle(.menu)

            Text("Amount: \(viewModel.betAmount)")
                .font(.subheadline)

            HStack(spacing: 6) {
                ForEach(viewModel.config.betPresets, id: \.self) { amount in
                    Button(action: {
                        viewModel.addBet(amount: amount)
                    }) {
                        Text("+\(amount)")
                            .font(.caption)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(Theme.panel)
                            .clipShape(Capsule())
                    }
                }
            }

            Button(action: {
                viewModel.placeBet()
            }) {
                Text("BET")
                    .font(.headline)
                    .foregroundStyle(.black)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 8)
                    .background(Theme.brassGold)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

struct ItemPanel: View {
    @EnvironmentObject private var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Items")
                .font(.headline)
            ForEach(0..<3, id: \.self) { index in
                let item = viewModel.items[safe: index]
                HStack {
                    Text(item?.name ?? "Locked")
                        .font(.subheadline)
                    Spacer()
                    Text(item == nil ? "--" : "x1")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(8)
                .background(Theme.panel.opacity(0.6))
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

struct LogPanel: View {
    @EnvironmentObject private var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Log")
                .font(.headline)
            ForEach(viewModel.logs) { entry in
                Text(entry.message)
                    .font(.caption)
            }
            Spacer()
        }
        .padding(12)
        .frame(maxWidth: .infinity)
        .background(Theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 14))
    }
}

private extension Array {
    subscript(safe index: Int) -> Element? {
        guard indices.contains(index) else { return nil }
        return self[index]
    }
}
