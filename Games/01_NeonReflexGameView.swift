import SwiftUI

struct NeonReflexGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    enum Signal { case wait, go, fake }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var signal: Signal = .wait
    @State private var currentScore = 0
    @State private var round = 1
    @State private var combo = 0
    @State private var goDate: Date?
    @State private var phaseTask: DispatchWorkItem?
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    var body: some View {
        GameContainerView(
            title: "Neon Reflex Reactor",
            isPaused: state == .paused,
            canPause: state == .playing,
            instructions: "Tap GO instantly. Avoid early taps and FAKE flashes.",
            onPauseToggle: { state == .paused ? resume() : pause() },
            onRestart: reset,
            onExit: { cleanup(); dismiss() }
        ) {
            VStack(spacing: 12) {
                Text("Round \(round)/10  Combo x\(combo)")
                Circle()
                    .fill(gradient)
                    .frame(width: 180, height: 180)
                    .overlay(Text(label).font(.title.bold()).foregroundStyle(.white))
                    .onTapGesture { tapCircle() }
                Text("Score: \(currentScore)").font(.title3.bold())
            }
            .onAppear(perform: start)
            .sheet(isPresented: $showResult) {
                ResultView(title: "Neon Reflex Reactor", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false
                    reset()
                }, onBackToHub: {
                    showResult = false
                    dismiss()
                })
            }
        }
    }

    private var label: String {
        switch signal { case .wait: return "WAIT"; case .go: return "GO"; case .fake: return "FAKE" }
    }

    private var gradient: LinearGradient {
        switch signal {
        case .wait: return LinearGradient(colors: [.gray, .black], startPoint: .top, endPoint: .bottom)
        case .go: return LinearGradient(colors: [.green, .mint], startPoint: .topLeading, endPoint: .bottomTrailing)
        case .fake: return LinearGradient(colors: [.orange, .red], startPoint: .topLeading, endPoint: .bottomTrailing)
        }
    }

    private func start() {
        guard state == .idle else { return }
        state = .playing
        setupRound()
    }

    private func setupRound() {
        signal = .wait
        goDate = nil
        phaseTask?.cancel()

        // Rule: random delay 0.6~2.2s before GO, with a 20% one-time FAKE flash chance.
        let fakeFirst = Int.random(in: 0..<100) < 20
        if fakeFirst {
            let fakeTask = DispatchWorkItem {
                guard state == .playing else { return }
                signal = .fake
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                    if state == .playing && signal == .fake { signal = .wait }
                }
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + Double.random(in: 0.3...0.9), execute: fakeTask)
        }

        let goTask = DispatchWorkItem {
            guard state == .playing else { return }
            signal = .go
            goDate = Date()
        }
        phaseTask = goTask
        DispatchQueue.main.asyncAfter(deadline: .now() + Double.random(in: 0.6...2.2), execute: goTask)
    }

    private func tapCircle() {
        guard state == .playing else { return }
        switch signal {
        case .go:
            let reactionMs = Int(Date().timeIntervalSince(goDate ?? Date()) * 1000)
            // Score: base=max(0,1000-reactionMs), combo bonus +5% each (cap +30%).
            let base = max(0, 1000 - reactionMs)
            combo += 1
            let bonus = min(0.30, Double(combo) * 0.05)
            currentScore += Int(Double(base) * (1.0 + bonus))
            Haptics.tap(style: .medium)
            advanceRound()
        case .fake, .wait:
            // Penalty: fake tap / early tap is -200 and combo break.
            currentScore -= 200
            combo = 0
            Haptics.tap(style: .rigid)
            advanceRound()
        }
    }

    private func advanceRound() {
        if round >= 10 { finish() }
        else {
            round += 1
            setupRound()
        }
    }

    private func pause() { state = .paused; phaseTask?.cancel() }
    private func resume() { state = .playing; setupRound() }
    private func reset() {
        cleanup()
        state = .idle; signal = .wait; currentScore = 0; round = 1; combo = 0
        start()
    }

    private func finish() {
        cleanup()
        state = .finished
        let result = scoreStore.saveScore(for: .neonReflex, score: currentScore)
        best = result.record.best
        isNewBest = result.isBest
        showResult = true
    }

    private func cleanup() { phaseTask?.cancel(); phaseTask = nil }
}
