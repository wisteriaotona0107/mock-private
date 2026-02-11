import SwiftUI

struct HexHunterGameView: View {
    enum PlayState { case idle, playing, paused, finished }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var bytes: [String] = Array(repeating: "00", count: 128)
    @State private var answer = 0
    @State private var selected: Int?
    @State private var question = 1
    @State private var timeLeft = 30
    @State private var currentScore = 0
    @State private var timer: Timer?
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    private let cols = Array(repeating: GridItem(.fixed(28), spacing: 4), count: 16)

    var body: some View {
        GameContainerView(title: "Hex Hunter", isPaused: state == .paused, canPause: state == .playing, instructions: "Find 1 anomaly in 128 bytes. 3 questions in 30 seconds.", onPauseToggle: {
            state == .paused ? resume() : pause()
        }, onRestart: reset, onExit: { cleanup(); dismiss() }) {
            VStack {
                Text("Q\(question)/3  Time \(timeLeft)s  Score \(currentScore)")
                ScrollView {
                    LazyVGrid(columns: cols, spacing: 4) {
                        ForEach(bytes.indices, id: \.self) { idx in
                            Text(bytes[idx])
                                .font(.caption2.monospaced())
                                .frame(width: 28, height: 22)
                                .background(selected == idx ? Color.yellow.opacity(0.6) : Color.clear)
                                .onTapGesture { pick(idx) }
                        }
                    }
                    .padding(8)
                }
            }
            .onAppear(perform: start)
            .sheet(isPresented: $showResult) {
                ResultView(title: "Hex Hunter", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset(); start()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private func start() {
        guard state == .idle else { return }
        state = .playing
        makeQuestion()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in
            guard state == .playing else { return }
            timeLeft -= 1
            if timeLeft <= 0 { finish() }
        }
    }

    private func makeQuestion() {
        bytes = (0..<128).map { String(format: "%02X", $0 % 256) }
        answer = Int.random(in: 0..<128)
        bytes[answer] = String(format: "%02X", Int.random(in: 0...255))
        selected = nil
    }

    private func pick(_ idx: Int) {
        guard state == .playing else { return }
        selected = idx
        // Score: correct adds remainingTime*50, wrong subtracts 200.
        if idx == answer { currentScore += timeLeft * 50 }
        else { currentScore -= 200 }

        if question >= 3 { finish() }
        else { question += 1; makeQuestion() }
    }

    private func pause() { state = .paused }
    private func resume() { state = .playing }
    private func reset() {
        cleanup()
        state = .idle; question = 1; timeLeft = 30; currentScore = 0
    }

    private func finish() {
        cleanup(); state = .finished
        let result = scoreStore.saveScore(for: .hexHunter, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func cleanup() { timer?.invalidate(); timer = nil }
}
