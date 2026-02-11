import SwiftUI

struct ProbabilityWizardGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    struct Choice: Identifiable {
        let id = UUID()
        let p: Double
        let reward: Int
        let loss: Int
        var ev: Double { p * Double(reward) - (1 - p) * Double(loss) }
    }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var choices: [Choice] = []
    @State private var question = 1
    @State private var feedback = ""
    @State private var currentScore = 0
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    var body: some View {
        GameContainerView(title: "Probability Wizard", isPaused: false, canPause: false, instructions: "Pick the card with highest EV: p*R - (1-p)*L.", onPauseToggle: {}, onRestart: reset, onExit: { dismiss() }) {
            VStack(spacing: 12) {
                Text("Q\(question)/10  Score \(currentScore)")
                HStack(spacing: 10) {
                    ForEach(Array(choices.enumerated()), id: \.offset) { idx, c in
                        Button {
                            choose(idx)
                        } label: {
                            VStack(alignment: .leading, spacing: 6) {
                                Text("p=\(String(format: "%.2f", c.p))")
                                Text("R=\(c.reward)")
                                Text("L=\(c.loss)")
                            }
                            .frame(maxWidth: .infinity, minHeight: 120, alignment: .leading)
                            .padding()
                            .background(.indigo.opacity(0.2), in: RoundedRectangle(cornerRadius: 12))
                        }
                        .buttonStyle(.plain)
                    }
                }
                Text(feedback)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .padding(.horizontal)
            }
            .onAppear(perform: start)
            .sheet(isPresented: $showResult) {
                ResultView(title: "Probability Wizard", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset(); start()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private func start() {
        guard state == .idle else { return }
        state = .playing
        makeQuestion()
    }

    private func makeQuestion() {
        choices = (0..<3).map { _ in
            Choice(p: Double.random(in: 0.2...0.9), reward: Int.random(in: 200...1200), loss: Int.random(in: 100...800))
        }
    }

    private func choose(_ idx: Int) {
        guard state == .playing else { return }
        let bestIndex = choices.indices.max(by: { choices[$0].ev < choices[$1].ev }) ?? 0
        let maxEV = choices[bestIndex].ev
        // Score: correct +500+difficulty, incorrect -200.
        if idx == bestIndex {
            let difficulty = Int(abs(choices[idx].ev - choices[(idx + 1) % 3].ev) < 80 ? 200 : 100)
            currentScore += 500 + difficulty
            feedback = "Correct: EV max = \(Int(maxEV))."
        } else {
            currentScore -= 200
            feedback = "Wrong. Best EV is card \(bestIndex + 1): \(Int(maxEV))."
        }

        if question >= 10 { finish() }
        else { question += 1; makeQuestion() }
    }

    private func reset() { state = .idle; choices = []; question = 1; feedback = ""; currentScore = 0 }

    private func finish() {
        state = .finished
        let result = scoreStore.saveScore(for: .probabilityWizard, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }
}
