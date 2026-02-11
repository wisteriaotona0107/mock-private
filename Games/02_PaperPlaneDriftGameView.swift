import SwiftUI
import CoreMotion

struct PaperPlaneDriftGameView: View {
    enum PlayState { case idle, playing, paused, finished }
    struct WindBand: Identifiable { let id = UUID(); var y: CGFloat; let x: CGFloat; let width: CGFloat; let height: CGFloat }

    @EnvironmentObject private var scoreStore: ScoreStore
    @Environment(\.dismiss) private var dismiss

    @State private var state: PlayState = .idle
    @State private var currentScore = 0
    @State private var hits = 0
    @State private var elapsed: Double = 0
    @State private var distance: Double = 0
    @State private var planeX: CGFloat = 0.5
    @State private var bands: [WindBand] = []
    @State private var timer: Timer?
    @State private var best = 0
    @State private var isNewBest = false
    @State private var showResult = false

    private let motion = CMMotionManager()

    var body: some View {
        GameContainerView(
            title: "Paper Plane Drift",
            isPaused: state == .paused,
            canPause: state == .playing,
            instructions: "Tilt device to move plane. Avoid wind zones. 3 hits = game over.",
            onPauseToggle: { state == .paused ? resume() : pause() },
            onRestart: reset,
            onExit: { cleanup(); dismiss() }
        ) {
            GeometryReader { geo in
                ZStack {
                    LinearGradient(colors: [.blue.opacity(0.5), .white], startPoint: .top, endPoint: .bottom)
                    ForEach(bands) { band in
                        Rectangle()
                            .fill(.purple.opacity(0.35))
                            .frame(width: band.width * geo.size.width, height: band.height)
                            .position(x: band.x * geo.size.width, y: band.y)
                    }
                    Triangle()
                        .fill(.orange)
                        .frame(width: 30, height: 30)
                        .position(x: planeX * geo.size.width, y: geo.size.height * 0.8)
                    VStack {
                        Text("Hits: \(hits)/3  Time: \(Int(elapsed))s")
                        Text("Score: \(currentScore)")
                    }
                    .font(.headline)
                    .padding(8)
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 8))
                    .position(x: geo.size.width/2, y: 40)
                }
                .onAppear { start(area: geo.size) }
            }
            .sheet(isPresented: $showResult) {
                ResultView(title: "Paper Plane Drift", score: currentScore, best: best, isNewBest: isNewBest, onRetry: {
                    showResult = false; reset()
                }, onBackToHub: { showResult = false; dismiss() })
            }
        }
    }

    private func start(area: CGSize) {
        guard state == .idle else { return }
        state = .playing
        spawnBand(height: area.height)
        startMotion()
        timer = Timer.scheduledTimer(withTimeInterval: 1.0 / 30.0, repeats: true) { _ in
            guard state == .playing else { return }
            elapsed += 1.0/30.0
            distance += 2
            bands = bands.map { var b = $0; b.y += 4; return b }.filter { $0.y < area.height + 60 }
            if Int.random(in: 0..<20) == 0 { spawnBand(height: area.height) }
            checkCollision(area: area)
            // Score: survival time*10 + distance bonus.
            currentScore = Int(elapsed * 10 + distance / 12)
        }
    }

    private func spawnBand(height: CGFloat) {
        bands.append(WindBand(y: -20, x: .random(in: 0.2...0.8), width: .random(in: 0.22...0.35), height: .random(in: 40...75)))
    }

    private func checkCollision(area: CGSize) {
        let px = planeX * area.width
        let py = area.height * 0.8
        for band in bands {
            let minX = band.x * area.width - (band.width * area.width / 2)
            let maxX = band.x * area.width + (band.width * area.width / 2)
            if px >= minX && px <= maxX && abs(py - band.y) < band.height / 2 {
                hits += 1
                Haptics.tap(style: .heavy)
                if hits >= 3 { finish() }
                break
            }
        }
    }

    private func startMotion() {
        guard motion.isDeviceMotionAvailable else { return }
        motion.deviceMotionUpdateInterval = 1.0 / 30.0
        motion.startDeviceMotionUpdates(to: .main) { data, _ in
            guard state == .playing, let roll = data?.attitude.roll else { return }
            let normalized = (roll / .pi) + 0.5
            planeX = min(0.95, max(0.05, CGFloat(normalized)))
        }
    }

    private func pause() { state = .paused }
    private func resume() { state = .playing }
    private func reset() {
        cleanup()
        state = .idle; currentScore = 0; hits = 0; elapsed = 0; distance = 0; planeX = 0.5; bands = []
    }

    private func finish() {
        cleanup()
        state = .finished
        let result = scoreStore.saveScore(for: .paperPlane, score: currentScore)
        best = result.record.best
        isNewBest = result.isBest
        showResult = true
    }

    private func cleanup() {
        timer?.invalidate(); timer = nil
        motion.stopDeviceMotionUpdates()
    }
}

private struct Triangle: Shape {
    func path(in rect: CGRect) -> Path {
        var p = Path()
        p.move(to: CGPoint(x: rect.midX, y: rect.minY))
        p.addLine(to: CGPoint(x: rect.maxX, y: rect.maxY))
        p.addLine(to: CGPoint(x: rect.minX, y: rect.maxY))
        p.closeSubpath()
        return p
    }
}
