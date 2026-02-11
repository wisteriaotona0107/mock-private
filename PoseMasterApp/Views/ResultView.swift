import SwiftUI

struct ResultView: View {
    let score: Int
    let highScore: Int
    let onBackToTitle: () -> Void

    var body: some View {
        VStack(spacing: 20) {
            Text("RESULT")
                .font(.largeTitle.bold())
                .foregroundStyle(.white)

            GlassPanel {
                VStack(spacing: 12) {
                    stat("SCORE", "\(score)")
                    stat("HIGH", "\(highScore)")
                    stat("RANK", rankText)
                }
            }
            .frame(maxWidth: 420)

            Button("Back to Title", action: onBackToTitle)
                .buttonStyle(.borderedProminent)
                .tint(.cyan)

        }
        .padding(24)
    }

    private var rankText: String {
        switch score {
        case 0..<4000: return "ROOKIE"
        case 4000..<9000: return "IRON"
        case 9000..<15000: return "TITAN"
        default: return "LEGEND"
        }
    }

    private func stat(_ k: String, _ v: String) -> some View {
        HStack {
            Text(k).foregroundStyle(.white.opacity(0.75))
            Spacer()
            Text(v)
                .font(.title3.bold())
                .foregroundStyle(.yellow)
        }
    }
}
