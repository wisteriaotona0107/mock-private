import SwiftUI
import SpriteKit

struct GameDashboardView: View {
    @EnvironmentObject private var viewModel: GameViewModel
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    var body: some View {
        GeometryReader { proxy in
            let totalHeight = proxy.size.height
            let raceHeight = totalHeight * 0.58
            let pusherHeight = totalHeight * 0.28
            let cardHeight = totalHeight * 0.14

            VStack(spacing: 0) {
                ZStack(alignment: .top) {
                    SpriteView(scene: viewModel.raceScene)
                        .ignoresSafeArea()
                        .frame(height: raceHeight)

                    HStack {
                        RaceInfoHUD()
                        Spacer()
                        WalletMultiplierHUD()
                    }
                    .padding([.top, .horizontal], 16)
                }

                SpriteView(scene: viewModel.pusherScene)
                    .frame(height: pusherHeight)

                BottomCardsView()
                    .frame(height: cardHeight)
            }
            .background(Theme.turfDeep)
            .ignoresSafeArea()
        }
    }
}

struct RaceInfoHUD: View {
    @EnvironmentObject private var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Race Info")
                .font(.headline)
            Text("State: \(viewModel.state.rawValue)")
                .font(.caption)
            if let horse = viewModel.selectedHorse {
                Text("Horse: \(horse.name)")
                    .font(.caption)
                Text("Odds: \(String(format: "%.1f", horse.odds))")
                    .font(.caption)
            } else {
                Text("Select a horse")
                    .font(.caption)
            }
        }
        .padding(10)
        .background(Theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct WalletMultiplierHUD: View {
    @EnvironmentObject private var viewModel: GameViewModel

    var body: some View {
        VStack(alignment: .trailing, spacing: 6) {
            Text("Coins: \(viewModel.coins)")
                .font(.headline)
            Text("Multiplier x\(String(format: "%.1f", viewModel.multiplier))")
                .font(.caption)
                .foregroundStyle(Theme.brassGold)
        }
        .padding(10)
        .background(Theme.panel)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

struct BottomCardsView: View {
    @Environment(\.horizontalSizeClass) private var horizontalSizeClass

    var body: some View {
        Group {
            if horizontalSizeClass == .compact {
                VStack(spacing: 12) {
                    BetPanel()
                    ItemPanel()
                    LogPanel()
                }
                .padding(.horizontal, 12)
            } else {
                HStack(spacing: 12) {
                    BetPanel()
                    ItemPanel()
                    LogPanel()
                }
                .padding(.horizontal, 12)
            }
        }
        .padding(.vertical, 8)
        .background(Theme.turfHighlight)
    }
}
