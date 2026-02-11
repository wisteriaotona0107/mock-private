import SwiftUI

struct RootView: View {
    @EnvironmentObject private var appState: AppState
    @State private var screen: Screen = .title
    @State private var lastScore: Int = 0

    enum Screen {
        case title, game, result
    }

    var body: some View {
        ZStack {
            StageBackgroundView()

            switch screen {
            case .title:
                TitleView(highScore: appState.highScore) {
                    screen = .game
                }
            case .game:
                GameView { score in
                    lastScore = score
                    appState.saveHighScore(score)
                    screen = .result
                }
            case .result:
                ResultView(score: lastScore, highScore: appState.highScore) {
                    screen = .title
                }
            }
        }
    }
}

struct StageBackgroundView: View {
    var body: some View {
        LinearGradient(
            colors: [Color(red: 0.06, green: 0.06, blue: 0.08), Color(red: 0.11, green: 0.08, blue: 0.12)],
            startPoint: .top,
            endPoint: .bottom
        )
        .overlay {
            TimelineView(.animation) { context in
                Canvas { ctx, size in
                    let t = context.date.timeIntervalSinceReferenceDate
                    for i in 0..<70 {
                        let x = CGFloat((sin(t * 0.2 + Double(i)) + 1) * 0.5) * size.width
                        let y = CGFloat((cos(t * 0.18 + Double(i) * 0.3) + 1) * 0.5) * size.height
                        let rect = CGRect(x: x, y: y, width: 1.2, height: 1.2)
                        ctx.fill(Path(ellipseIn: rect), with: .color(.white.opacity(0.05)))
                    }
                }
            }
        }
        .ignoresSafeArea()
    }
}
