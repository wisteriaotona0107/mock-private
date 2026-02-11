import SwiftUI

struct StatBattleGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    struct Fighter { var hp: Int; var atk: Int; var def: Int; var crit: Int }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var atk = 4
    @State private var def = 3
    @State private var luck = 3
    @State private var playerHP = 100
    @State private var enemy = Fighter(hp: 0, atk: 0, def: 0, crit: 0)
    @State private var wins = 0
    @State private var logs: [String] = []
    @State private var currentScore = 0
    @State private var showResult = false
    @State private var best = 0
    @State private var isNewBest = false

    private var pointsLeft: Int { 10 - atk - def - luck }

    var body: some View {
        GameContainerView(title: "Stat Battle", isPaused: state == .paused, canPause: state == .playing, instructions: "Allocate 10 points then fight. Need 3 wins.", onPauseToggle: {
            state == .paused ? resume() : pause()
        }, onRestart: reset, onExit: { dismiss() }) {
            VStack(spacing: 10) {
                if state == .idle { allocationView }
                else { battleView }
            }
            .sheet(isPresented: $showResult) {
                ResultView(title: "Stat Battle", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private var allocationView: some View {
        VStack(spacing: 8) {
            Text("Points Left: \(pointsLeft)")
            statStepper(title: "ATK", value: $atk)
            statStepper(title: "DEF", value: $def)
            statStepper(title: "LUK", value: $luck)
            Button("Start Battle") { start() }
                .buttonStyle(.borderedProminent)
                .disabled(pointsLeft != 0)
        }
    }

    private var battleView: some View {
        VStack(spacing: 8) {
            Text("Wins: \(wins)/3")
            Text("HP \(playerHP) vs Enemy \(enemy.hp)")
            Button("Attack Turn") { turn() }
                .buttonStyle(.borderedProminent)
                .disabled(state != .playing)
            VStack(alignment: .leading) {
                ForEach(logs.suffix(3), id: \.self) { Text($0).font(.caption.monospaced()) }
            }
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding()
            .background(.gray.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
        }
    }

    private func statStepper(title: String, value: Binding<Int>) -> some View {
        Stepper("\(title): \(value.wrappedValue)", value: value, in: 0...10)
            .onChange(of: value.wrappedValue) { _, _ in rebalance() }
    }

    private func rebalance() {
        let total = atk + def + luck
        if total <= 10 { return }
        if luck > 0 { luck -= 1 }
        else if def > 0 { def -= 1 }
        else { atk -= 1 }
    }

    private func start() {
        guard pointsLeft == 0 else { return }
        state = .playing
        playerHP = 100
        wins = 0
        logs = []
        spawnEnemy()
    }

    private func spawnEnemy() {
        enemy = Fighter(hp: Int.random(in: 50...90), atk: Int.random(in: 8...14), def: Int.random(in: 2...8), crit: Int.random(in: 8...25))
    }

    private func turn() {
        guard state == .playing else { return }
        // Damage formula: max(1, atk-enemyDef) + luck-based critical.
        var playerDamage = max(1, atk * 3 - enemy.def)
        if Int.random(in: 0..<100) < luck * 5 { playerDamage += 12; logs.append("Player critical!") }
        enemy.hp -= playerDamage
        logs.append("Player hits \(playerDamage)")
        if enemy.hp <= 0 {
            wins += 1
            if wins >= 3 { finish() }
            else { spawnEnemy() }
            return
        }

        var enemyDamage = max(1, enemy.atk - def)
        if Int.random(in: 0..<100) < enemy.crit { enemyDamage += 8 }
        playerHP -= enemyDamage
        logs.append("Enemy hits \(enemyDamage)")
        if playerHP <= 0 { finish() }
    }

    private func finish() {
        state = .finished
        // Score: wins*800 + remainingHP*10.
        currentScore = max(0, wins * 800 + max(0, playerHP) * 10)
        let result = scoreStore.saveScore(for: .statBattle, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func pause() { state = .paused }
    private func resume() { state = .playing }
    private func reset() {
        state = .idle
        atk = 4; def = 3; luck = 3
        playerHP = 100; wins = 0; logs = []; currentScore = 0
    }
}
