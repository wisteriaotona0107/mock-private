import SwiftUI

struct PrecisionSniperGameView: View {
    enum PlayState { case idle, playing, paused, finished }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var currentScore = 0
    @State private var shot = 1
    @State private var value: Double = -1
    @State private var direction = 1.0
    @State private var timer: Timer?
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    var body: some View {
        GameContainerView(title: "Precision Sniper", isPaused: state == .paused, canPause: state == .playing, instructions: "Tap while moving marker is closest to center line.", onPauseToggle: {
            state == .paused ? resume() : pause()
        }, onRestart: reset, onExit: {
            cleanup(); dismiss()
        }) {
            VStack(spacing: 18) {
                Text("Shot \(shot)/10")
                GeometryReader { geo in
                    ZStack {
                        Capsule().fill(.gray.opacity(0.3)).frame(height: 16)
                        Rectangle().fill(.red).frame(width: 2)
                        Circle().fill(.blue).frame(width: 24, height: 24)
                            .position(x: ((value + 1) / 2) * geo.size.width, y: geo.size.height / 2)
                    }
                }
                .frame(height: 40)
                .padding(.horizontal)
                Button("Stop") { stopShot() }
                    .buttonStyle(.borderedProminent)
                Text("Score: \(currentScore)").font(.title3.bold())
            }
            .onAppear(perform: start)
            .sheet(isPresented: $showResult) {
                ResultView(title: "Precision Sniper", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset(); start()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private func start() {
        guard state == .idle else { return }
        state = .playing
        timer = Timer.scheduledTimer(withTimeInterval: 1.0/60.0, repeats: true) { _ in
            guard state == .playing else { return }
            value += direction * 0.03
            if abs(value) >= 1 {
                value = max(-1, min(1, value))
                direction *= -1
            }
        }
    }

    private func stopShot() {
        guard state == .playing else { return }
        // Score: max(0,1000*(1-abs(value))) with +200 perfect <=0.02.
        var perShot = Int(max(0, 1000 * (1 - abs(value))))
        if abs(value) <= 0.02 { perShot += 200 }
        currentScore += perShot
        Haptics.tap(style: .medium)
        if shot >= 10 { finish() }
        else { shot += 1 }
    }

    private func pause() { state = .paused }
    private func resume() { state = .playing }
    private func reset() {
        cleanup()
        state = .idle; currentScore = 0; shot = 1; value = -1; direction = 1
    }

    private func finish() {
        cleanup()
        state = .finished
        let result = scoreStore.saveScore(for: .precisionSniper, score: currentScore)
        best = result.record.best
        isNewBest = result.isBest
        showResult = true
    }

    private func cleanup() { timer?.invalidate(); timer = nil }
}
