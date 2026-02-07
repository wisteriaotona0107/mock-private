import SwiftUI

struct RootView: View {
    @EnvironmentObject private var viewModel: GameViewModel
    @State private var showGame = false

    var body: some View {
        ZStack {
            Theme.turfDeep.ignoresSafeArea()
            if showGame {
                GameDashboardView()
                    .fullScreenCover(isPresented: Binding(
                        get: { viewModel.state == .result },
                        set: { isPresented in
                            if !isPresented {
                                viewModel.startNewRound()
                            }
                        }
                    )) {
                        ResultView(showGame: $showGame)
                            .environmentObject(viewModel)
                    }
            } else {
                HomeView(showGame: $showGame)
            }
        }
    }
}
