import SwiftUI

struct GameView: View {
    let onFinish: (Int) -> Void

    @StateObject private var engine: GameEngine
    @StateObject private var vfx = VFXCoordinator()
    @StateObject private var visualPlayer: PoseVisualPlayer

    @State private var autoDemo = false
    @State private var autoDemoTimer: Timer?

    init(onFinish: @escaping (Int) -> Void) {
        self.onFinish = onFinish
        let loader = BundleDataLoader()
        let poses = loader.loadPoses()
        let rules = loader.loadRules()
        _engine = StateObject(wrappedValue: GameEngine(rules: rules, poses: poses))
        _visualPlayer = StateObject(wrappedValue: PoseVisualPlayer(poses: poses))
    }

    var body: some View {
        GeometryReader { geo in
            VStack(spacing: 12) {
                topHUD
                stageCard(height: min(max(geo.size.height * 0.46, 260), 420))
                controls
            }
            .padding(12)
            .overlay(alignment: .center) {
                VFXOverlayView(coordinator: vfx)
            }
            .onAppear {
                engine.onJudge = { judge, combo in
                    vfx.react(to: judge, combo: combo)
                }
                engine.start()
            }
            .onDisappear {
                engine.stop()
                stopAutoDemo()
            }
            .onChange(of: engine.latestPoseID) { _, poseID in
                visualPlayer.play(poseId: poseID)
            }
            .onChange(of: engine.finished) { _, isDone in
                if isDone { onFinish(engine.score) }
            }
        }
    }

    private var topHUD: some View {
        GlassPanel {
            HStack(spacing: 10) {
                HUDStatView(title: "SCORE", value: "\(engine.score)")
                HUDStatView(title: "COMBO", value: "x\(engine.combo)")
                HUDStatView(title: "TIME", value: String(format: "%.1f", engine.timeRemaining))
                HUDStatView(title: "JUDGE", value: engine.judgeText)
            }
        }
    }

    private func stageCard(height: CGFloat) -> some View {
        GlassPanel {
            ZStack {
                spotlight
                PoseVisualView(player: visualPlayer)
                    .padding(8)
                    .offset(x: engine.stageShake == 0 ? 0 : CGFloat.random(in: -engine.stageShake...engine.stageShake),
                            y: engine.stageShake == 0 ? 0 : CGFloat.random(in: -engine.stageShake...engine.stageShake))
            }
            .frame(maxWidth: .infinity)
            .frame(height: height)
        }
    }

    private var spotlight: some View {
        LinearGradient(colors: [.white.opacity(0.2), .clear], startPoint: .top, endPoint: .bottom)
            .mask {
                Rectangle()
                    .fill(.linearGradient(colors: [.white, .clear], startPoint: .top, endPoint: .bottom))
            }
            .overlay {
                TimelineView(.animation) { context in
                    let phase = sin(context.date.timeIntervalSinceReferenceDate * 1.4)
                    Rectangle()
                        .fill(
                            LinearGradient(colors: [.clear, .yellow.opacity(0.16), .clear], startPoint: .leading, endPoint: .trailing)
                        )
                        .frame(width: 140)
                        .offset(x: CGFloat(phase) * 180)
                        .blendMode(.screen)
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 20))
    }

    private var controls: some View {
        GlassPanel {
            VStack(spacing: 10) {
                HStack(spacing: 8) {
                    ForEach(Lane.allCases, id: \.self) { lane in
                        LaneButton(lane: lane) {
                            engine.hit(lane: lane)
                        }
                    }
                }

                Toggle("Auto demo", isOn: $autoDemo)
                    .toggleStyle(.switch)
                    .foregroundStyle(.white)
                    .onChange(of: autoDemo) { _, isOn in
                        isOn ? startAutoDemo() : stopAutoDemo()
                    }
            }
        }
    }

    private func startAutoDemo() {
        stopAutoDemo()
        autoDemoTimer = Timer.scheduledTimer(withTimeInterval: 0.24, repeats: true) { _ in
            Task { @MainActor in
                if let lane = Lane.allCases.randomElement() {
                    engine.hit(lane: lane)
                }
            }
        }
    }

    private func stopAutoDemo() {
        autoDemoTimer?.invalidate()
        autoDemoTimer = nil
    }
}
