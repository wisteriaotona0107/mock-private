import SwiftUI

struct MiniCityGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    enum Building: String, CaseIterable { case house = "🏠", factory = "🏭", park = "🌳" }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var grid: [[Building?]] = Array(repeating: Array(repeating: nil, count: 5), count: 5)
    @State private var turn = 1
    @State private var selected: Building = .house
    @State private var currentScore = 0
    @State private var best = 0
    @State private var isNewBest = false
    @State private var showResult = false

    var body: some View {
        GameContainerView(title: "Mini City", isPaused: state == .paused, canPause: false, instructions: "Pick a building and place it. No undo, 10 turns total.", onPauseToggle: {}, onRestart: reset, onExit: { dismiss() }) {
            VStack(spacing: 10) {
                Picker("Building", selection: $selected) {
                    ForEach(Building.allCases, id: \.self) { Text($0.rawValue).tag($0) }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal)
                Text("Turn \(turn)/10  Score \(currentScore)")
                board
            }
            .onAppear { state = .playing }
            .sheet(isPresented: $showResult) {
                ResultView(title: "Mini City", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private var board: some View {
        VStack(spacing: 4) {
            ForEach(0..<5, id: \.self) { y in
                HStack(spacing: 4) {
                    ForEach(0..<5, id: \.self) { x in
                        Text(grid[y][x]?.rawValue ?? "")
                            .frame(width: 56, height: 56)
                            .background(.gray.opacity(0.2), in: RoundedRectangle(cornerRadius: 8))
                            .onTapGesture { place(x: x, y: y) }
                    }
                }
            }
        }
    }

    private func place(x: Int, y: Int) {
        guard state == .playing, grid[y][x] == nil, turn <= 10 else { return }
        grid[y][x] = selected
        // Score: sum each turn after placement using adjacency relation.
        currentScore += evaluateCell(x: x, y: y)
        turn += 1
        if turn > 10 { finish() }
    }

    private func evaluateCell(x: Int, y: Int) -> Int {
        guard let b = grid[y][x] else { return 0 }
        let neighbors = [(-1,0),(1,0),(0,-1),(0,1)].compactMap { dx, dy -> Building? in
            let nx = x + dx, ny = y + dy
            guard (0..<5).contains(nx), (0..<5).contains(ny) else { return nil }
            return grid[ny][nx]
        }
        switch b {
        case .house:
            return 100 + neighbors.filter { $0 == .park }.count * 50 - neighbors.filter { $0 == .factory }.count * 60
        case .factory:
            return 120 - neighbors.filter { $0 == .house }.count * 80
        case .park:
            return 60 + neighbors.filter { $0 == .house }.count * 30
        }
    }

    private func finish() {
        state = .finished
        let result = scoreStore.saveScore(for: .miniCity, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func reset() {
        state = .playing
        grid = Array(repeating: Array(repeating: nil, count: 5), count: 5)
        turn = 1; currentScore = 0; selected = .house
    }
}
