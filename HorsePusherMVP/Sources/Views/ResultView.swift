import SwiftUI

struct ResultView: View {
    @EnvironmentObject private var viewModel: GameViewModel
    @Binding var showGame: Bool

    var body: some View {
        VStack(spacing: 16) {
            Text("Result")
                .font(.largeTitle.bold())

            if let result = viewModel.lastResult {
                VStack(spacing: 8) {
                    Text("Winner: \(result.winningHorse.name)")
                        .font(.headline)
                    ForEach(result.ranking.prefix(3).indices, id: \.self) { index in
                        let horse = result.ranking[index]
                        Text("\(index + 1). \(horse.name)")
                            .font(.subheadline)
                    }
                }
            }

            Text("Payout: \(viewModel.lastPayout)")
                .font(.title2)
                .foregroundStyle(Theme.brassGold)

            Text("Coins: \(viewModel.coins)")
                .font(.headline)

            HStack(spacing: 12) {
                Button("Race Again") {
                    viewModel.startNewRound()
                }
                .buttonStyle(.borderedProminent)

                Button("Back to Home") {
                    showGame = false
                }
                .buttonStyle(.bordered)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .background(Theme.turfDeep)
        .foregroundStyle(.white)
    }
}
