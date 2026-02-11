import SwiftUI

struct ReverseMemoryGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    enum Phase { case show, input }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var phase: Phase = .show
    @State private var sequence: [Int] = []
    @State private var visibleNumber: Int? = nil
    @State private var input: [Int] = []
    @State private var length = 3
    @State private var misses = 0
    @State private var combo = 0
    @State private var currentScore = 0
    @State private var timer: Timer?
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    var body: some View {
        GameContainerView(title: "Reverse Memory Drop", isPaused: state == .paused, canPause: state == .playing, instructions: "Memorize digits then enter them in reverse order.", onPauseToggle: {
            state == .paused ? resume() : pause()
        }, onRestart: reset, onExit: { cleanup(); dismiss() }) {
            VStack(spacing: 14) {
                Text("Misses \(misses)/3  Length \(length)")
                Text(phase == .show ? "SHOW" : "INPUT")
                    .font(.headline)
                    .foregroundStyle(phase == .show ? .blue : .green)
                Text(visibleNumber.map(String.init) ?? "•")
                    .font(.system(size: 64, weight: .bold, design: .rounded))
                    .frame(height: 90)
                HStack {
                    ForEach(0..<10, id: \.self) { n in
                        Button("\(n)") { tapNum(n) }
                            .buttonStyle(.bordered)
                    }
                }
                .font(.caption)
                .disabled(phase != .input || state != .playing)
                Text("Score: \(currentScore)")
            }
            .onAppear(perform: start)
            .sheet(isPresented: $showResult) {
                ResultView(title: "Reverse Memory Drop", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset(); start()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private func start() {
        guard state == .idle else { return }
        state = .playing
        nextRound()
    }

    private func nextRound() {
        sequence = (0..<length).map { _ in Int.random(in: 0...9) }
        input = []
        phase = .show
        showSequence(index: 0)
    }

    private func showSequence(index: Int) {
        guard state == .playing else { return }
        if index >= sequence.count {
            visibleNumber = nil
            phase = .input
            return
        }
        visibleNumber = sequence[index]
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0, repeats: false) { _ in
            showSequence(index: index + 1)
        }
    }

    private func tapNum(_ n: Int) {
        input.append(n)
        if input.count == sequence.count {
            let target = Array(sequence.reversed())
            if input == target {
                combo += 1
                // Score: sum of correct lengths *100, with combo bonus.
                currentScore += length * 100 + combo * 20
                length += 1
            } else {
                misses += 1
                combo = 0
                if misses >= 3 { finish(); return }
            }
            nextRound()
        }
    }

    private func pause() { state = .paused; timer?.invalidate() }
    private func resume() { state = .playing; if phase == .show { showSequence(index: 0) } }
    private func reset() { cleanup(); state = .idle; length = 3; misses = 0; combo = 0; currentScore = 0; visibleNumber = nil }

    private func finish() {
        cleanup(); state = .finished
        let result = scoreStore.saveScore(for: .reverseMemory, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func cleanup() { timer?.invalidate(); timer = nil }
}
