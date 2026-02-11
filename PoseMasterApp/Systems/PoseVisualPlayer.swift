import SwiftUI
import AVKit

protocol PoseVisualPlayable {
    func play(poseId: String)
}

@MainActor
final class PoseVisualPlayer: ObservableObject, PoseVisualPlayable {
    @Published var activePose: PoseDefinition?
    @Published var playbackToken = UUID()

    let poses: [String: PoseDefinition]

    init(poses: [PoseDefinition]) {
        self.poses = Dictionary(uniqueKeysWithValues: poses.map { ($0.id, $0) })
        self.activePose = poses.first
    }

    func play(poseId: String) {
        guard let pose = poses[poseId] else { return }
        activePose = pose
        playbackToken = UUID()
    }
}

struct PoseVisualView: View {
    @ObservedObject var player: PoseVisualPlayer

    var body: some View {
        ZStack {
            Color.black.opacity(0.35)

            if let pose = player.activePose {
                Group {
                    switch pose.asset.type {
                    case .imageSequence:
                        PoseImageSequenceView(assetName: pose.asset.name, playbackToken: player.playbackToken)
                    case .videoClip:
                        PoseVideoClipView(assetName: pose.asset.name, playbackToken: player.playbackToken)
                    }
                }
                .overlay(alignment: .bottom) {
                    Text(pose.name)
                        .font(.headline)
                        .foregroundStyle(.white.opacity(0.95))
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(.ultraThinMaterial, in: Capsule())
                        .padding(12)
                }
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.25), lineWidth: 1)
        )
    }
}

struct PoseImageSequenceView: View {
    let assetName: String
    let playbackToken: UUID
    @State private var frameIndex = 0
    @State private var timer: Timer?

    private let totalFrames = 12

    var body: some View {
        Group {
            if let image = UIImage(named: "\(assetName)_\(String(format: "%02d", frameIndex + 1))") {
                Image(uiImage: image)
                    .resizable()
                    .scaledToFit()
            } else {
                PlaceholderPoseSilhouette(label: assetName)
            }
        }
        .onChange(of: playbackToken) { _, _ in
            startAnimation()
        }
        .onAppear { startAnimation() }
        .onDisappear { timer?.invalidate() }
    }

    private func startAnimation() {
        frameIndex = 0
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: 0.06, repeats: true) { t in
            frameIndex += 1
            if frameIndex >= totalFrames {
                frameIndex = 0
                t.invalidate()
            }
        }
    }
}

struct PoseVideoClipView: View {
    let assetName: String
    let playbackToken: UUID

    @State private var player: AVPlayer?

    var body: some View {
        Group {
            if let player {
                VideoPlayer(player: player)
                    .scaledToFit()
                    .onAppear { restart() }
                    .onChange(of: playbackToken) { _, _ in restart() }
            } else {
                PlaceholderPoseSilhouette(label: assetName)
                    .onAppear { setupPlayer() }
            }
        }
    }

    private func setupPlayer() {
        guard let url = Bundle.main.url(forResource: assetName, withExtension: "mp4") else {
            return
        }
        player = AVPlayer(url: url)
        player?.actionAtItemEnd = .pause
    }

    private func restart() {
        setupPlayer()
        player?.seek(to: .zero)
        player?.play()
    }
}

struct PlaceholderPoseSilhouette: View {
    let label: String

    var body: some View {
        ZStack {
            LinearGradient(colors: [.cyan.opacity(0.4), .orange.opacity(0.4)], startPoint: .topLeading, endPoint: .bottomTrailing)
            VStack(spacing: 12) {
                Image(systemName: "figure.strengthtraining.traditional")
                    .resizable()
                    .scaledToFit()
                    .frame(width: 90, height: 90)
                    .foregroundStyle(.white)
                    .shadow(color: .red.opacity(0.6), radius: 20)
                Text("Asset Missing: \(label)")
                    .font(.caption)
                    .foregroundStyle(.white)
            }
            .padding()
        }
    }
}
