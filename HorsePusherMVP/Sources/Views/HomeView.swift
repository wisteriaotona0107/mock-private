import SwiftUI

struct HomeView: View {
    @EnvironmentObject private var viewModel: GameViewModel
    @Binding var showGame: Bool

    var body: some View {
        VStack(spacing: 24) {
            Text("Derby Pusher")
                .font(.system(size: 36, weight: .bold))
                .foregroundStyle(.white)

            VStack(spacing: 12) {
                HStack {
                    Text("Coins")
                    Spacer()
                    Text("\(viewModel.coins)")
                }
                HStack {
                    Text("Best Payout")
                    Spacer()
                    Text("\(viewModel.bestPayout)")
                }
            }
            .padding()
            .background(Theme.panel)
            .clipShape(RoundedRectangle(cornerRadius: 16))

            Button(action: {
                showGame = true
                viewModel.state = .idle
            }) {
                Text("PLAY")
                    .font(.title2.bold())
                    .foregroundStyle(.black)
                    .frame(maxWidth: 240)
                    .padding(.vertical, 12)
                    .background(Theme.brassGold)
                    .clipShape(Capsule())
            }
        }
        .padding(32)
    }
}
