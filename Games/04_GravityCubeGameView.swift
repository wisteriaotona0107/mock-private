import SwiftUI

struct GravityCubeGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    struct Stage { let walls: Set<Point>; let start: Point; let goal: Point }
    struct Point: Hashable { let x: Int; let y: Int }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var stageIndex = 0
    @State private var player = Point(x: 0, y: 0)
    @State private var gravity = 0
    @State private var moves = 0
    @State private var timeSec = 0
    @State private var timer: Timer?
    @State private var currentScore = 0
    @State private var best = 0
    @State private var isNewBest = false
    @State private var showResult = false

    private let size = 7
    private let stages: [Stage] = [
        Stage(walls: [Point(x: 1, y: 1), Point(x: 1, y: 2), Point(x: 3, y: 3), Point(x: 5, y: 4)], start: Point(x: 0, y: 0), goal: Point(x: 6, y: 6)),
        Stage(walls: [Point(x: 2, y: 0), Point(x: 2, y: 1), Point(x: 2, y: 2), Point(x: 4, y: 4), Point(x: 5, y: 4)], start: Point(x: 0, y: 6), goal: Point(x: 6, y: 0)),
        Stage(walls: [Point(x: 1, y: 5), Point(x: 2, y: 5), Point(x: 3, y: 5), Point(x: 3, y: 2), Point(x: 4, y: 2)], start: Point(x: 1, y: 0), goal: Point(x: 6, y: 3))
    ]

    var body: some View {
        GameContainerView(title: "Gravity Cube Puzzle", isPaused: state == .paused, canPause: state == .playing, instructions: "Tap Rotate Gravity. Player slides until wall/edge.", onPauseToggle: {
            state == .paused ? resume() : pause()
        }, onRestart: reset, onExit: { cleanup(); dismiss() }) {
            VStack(spacing: 12) {
                Text("Stage \(stageIndex + 1)/3  Moves \(moves)/20  Time \(timeSec)s")
                grid
                Button("Rotate Gravity") { rotateAndMove() }
                    .buttonStyle(.borderedProminent)
                Text("Gravity: \(["→","↓","←","↑"][gravity])")
            }
            .onAppear(perform: start)
            .sheet(isPresented: $showResult) {
                ResultView(title: "Gravity Cube Puzzle", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset(); start()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private var grid: some View {
        GeometryReader { geo in
            let cell = min(geo.size.width, geo.size.height) / CGFloat(size)
            VStack(spacing: 0) {
                ForEach(0..<size, id: \.self) { y in
                    HStack(spacing: 0) {
                        ForEach(0..<size, id: \.self) { x in
                            let p = Point(x: x, y: y)
                            Rectangle()
                                .fill(fill(for: p))
                                .overlay(Rectangle().stroke(.black.opacity(0.2)))
                                .frame(width: cell, height: cell)
                        }
                    }
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
        .frame(height: 320)
    }

    private func fill(for point: Point) -> Color {
        let stage = stages[stageIndex]
        if point == player { return .blue }
        if point == stage.goal { return .green }
        if stage.walls.contains(point) { return .black }
        return .gray.opacity(0.2)
    }

    private func start() {
        guard state == .idle else { return }
        player = stages[stageIndex].start
        state = .playing
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { _ in if state == .playing { timeSec += 1 } }
    }

    private func rotateAndMove() {
        guard state == .playing else { return }
        gravity = (gravity + 1) % 4
        moves += 1
        slide()
        if moves > 20 { fail() }
    }

    private func slide() {
        let stage = stages[stageIndex]
        var next = player
        let delta: (Int, Int) = switch gravity { case 0: (1,0); case 1:(0,1); case 2:(-1,0); default:(0,-1) }
        while true {
            let candidate = Point(x: next.x + delta.0, y: next.y + delta.1)
            if candidate.x < 0 || candidate.x >= size || candidate.y < 0 || candidate.y >= size || stage.walls.contains(candidate) { break }
            next = candidate
        }
        player = next
        if player == stage.goal {
            if stageIndex == stages.count - 1 { clear() }
            else { stageIndex += 1; moves = 0; timeSec = 0; player = stages[stageIndex].start }
        }
    }

    private func clear() {
        cleanup(); state = .finished
        // Score: 2000 - moves*100 - time*10, floor 0.
        currentScore = max(0, 2000 - (moves * 100) - (timeSec * 10))
        let result = scoreStore.saveScore(for: .gravityCube, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func fail() { cleanup(); finish(score: 0) }
    private func finish(score: Int) {
        state = .finished; currentScore = score
        let result = scoreStore.saveScore(for: .gravityCube, score: currentScore)
        best = result.record.best; isNewBest = result.isBest; showResult = true
    }

    private func pause() { state = .paused }
    private func resume() { state = .playing }
    private func reset() { cleanup(); state = .idle; stageIndex = 0; gravity = 0; moves = 0; timeSec = 0; currentScore = 0 }
    private func cleanup() { timer?.invalidate(); timer = nil }
}
