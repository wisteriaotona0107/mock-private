import SwiftUI

struct ResultView: View {
    let title: String
    let score: Int
    let best: Int
    let isNewBest: Bool
    let onRetry: () -> Void
    let onBackToHub: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Text("Result")
                .font(.largeTitle.bold())
            Text(title)
                .font(.headline)
                .foregroundStyle(.secondary)
            Text("Score: \(score)")
                .font(.title2.bold())
            Text("Best: \(best)")
                .font(.title3)
            if isNewBest {
                Text("🎉 New Best!")
                    .font(.headline)
                    .foregroundStyle(.green)
            }
            HStack(spacing: 12) {
                Button("Retry", action: onRetry)
                    .buttonStyle(.borderedProminent)
                Button("Back to Hub", action: onBackToHub)
                    .buttonStyle(.bordered)
            }
        }
        .padding()
        .presentationDetents([.medium])
    }
}
