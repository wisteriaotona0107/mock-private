import SwiftUI

struct OneButtonRunnerGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    struct Obstacle: Identifiable { let id = UUID(); var x: CGFloat; let width: CGFloat; let height: CGFloat }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var playerY: CGFloat = 0
    @State private var velocityY: CGFloat = 0
    @State private var obstacles: [Obstacle] = []
    @State private var timer: Timer?
    @State private var currentScore = 0
    @State private var distance = 0
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    var body: some View {
        GameContainerView(title: "One Button Runner", isPaused: state == .paused, canPause: state == .playing, instructions: "Tap game area to jump. Avoid incoming blocks.", onPauseToggle: {
            state == .paused ? resume() : pause()
        }, onRestart: reset, onExit: { cleanup(); dismiss() }) {
            GeometryReader { geo in
                ZStack(alignment: .bottomLeading) {
                    Rectangle().fill(.black.opacity(0.9))
                    Rectangle().fill(.green.opacity(0.25)).frame(height: 40)
                    Circle().fill(.yellow).frame(width: 28, height: 28)
                        .position(x: 60, y: geo.size.height - 40 - playerY)
                    ForEach(obstacles) { o in
                        Rectangle().fill(.red)
                            .frame(width: o.width, height: o.height)
                            .position(x: o.x, y: geo.size.height - 20 - o.height / 2)
                    }
                    Text("Score \(currentScore)")
                        .foregroundStyle(.white)
                        .padding()
                }
                .contentShape(Rectangle())
                .onTapGesture { jump() }
                .onAppear { start(width: geo.size.width, height: geo.size.height) }
            }
            .sheet(isPresented: $showResult) {
                ResultView(title: "One Button Runner", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private func start(width: CGFloat, height: CGFloat) {
        guard state == .idle else { return }
        state = .playing
        timer = Timer.scheduledTimer(withTimeInterval: 1.0/60.0, repeats: true) { _ in
            guard state == .playing else { return }
            // 60fps-like loop: gravity, jump velocity, obstacle movement.
            velocityY -= 0.75
            playerY = max(0, playerY + velocityY)
            if playerY == 0 { velocityY = 0 }

            obstacles = obstacles.map { var o = $0; o.x -= 5; return o }.filter { $0.x > -30 }
            if Int.random(in: 0..<40) == 0 {
                obstacles.append(Obstacle(x: width + 20, width: 20, height: .random(in: 30...60)))
            }

            if checkCollision(height: height) { finish(); return }
            distance += 1
            // Score: survival frames / distance.
            currentScore = distance / 3
        }
    }

    private func jump() {
        guard state == .playing, playerY == 0 else { return }
        velocityY = 12
        Haptics.tap(style: .light)
    }

    private func checkCollision(height: CGFloat) -> Bool {
        let playerRect = CGRect(x: 46, y: height - 54 - playerY, width: 28, height: 28)
        for o in obstacles {
            let r = CGRect(x: o.x - o.width/2, y: height - 40 - o.height, width: o.width, height: o.height)
            if playerRect.intersects(r) { return true }
        }
        return false
    }

    private func pause() { state = .paused }
    private func resume() { state = .playing }
    private func reset() { cleanup(); state = .idle; playerY = 0; velocityY = 0; obstacles = []; currentScore = 0; distance = 0 }

    private func finish() {
        cleanup(); state = .finished
        let result = scoreStore.saveScore(for: .oneButtonRunner, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func cleanup() { timer?.invalidate(); timer = nil }
}
