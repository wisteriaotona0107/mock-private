import SwiftUI

struct GameSelectionView: View {
    @EnvironmentObject private var scoreStore: ScoreStore

    private let columns = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 12) {
                    ForEach(GameID.allCases) { game in
                        NavigationLink(value: game) {
                            GameTileView(game: game, record: scoreStore.load(game))
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding()
            }
            .navigationTitle("Lite Games x10")
            .navigationDestination(for: GameID.self) { game in
                destination(for: game)
            }
        }
    }

    @ViewBuilder
    private func destination(for game: GameID) -> some View {
        switch game {
        case .neonReflex: NeonReflexGameView()
        case .paperPlane: PaperPlaneDriftGameView()
        case .precisionSniper: PrecisionSniperGameView()
        case .gravityCube: GravityCubeGameView()
        case .statBattle: StatBattleGameView()
        case .hexHunter: HexHunterGameView()
        case .miniCity: MiniCityGameView()
        case .reverseMemory: ReverseMemoryGameView()
        case .oneButtonRunner: OneButtonRunnerGameView()
        case .probabilityWizard: ProbabilityWizardGameView()
        }
    }
}
