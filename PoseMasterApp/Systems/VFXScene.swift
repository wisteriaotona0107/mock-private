import SpriteKit
import SwiftUI

@MainActor
final class VFXCoordinator: ObservableObject {
    @Published var combo: Int = 0
    let scene: StageVFXScene

    init(size: CGSize = CGSize(width: 1280, height: 720)) {
        scene = StageVFXScene(size: size)
        scene.scaleMode = .resizeFill
    }

    func react(to judge: JudgeResult, combo: Int) {
        self.combo = combo
        scene.updateIntensity(combo: combo)
        scene.trigger(judge: judge, combo: combo)
    }
}

final class StageVFXScene: SKScene {
    private let dust = SKEmitterNode()
    private let sparks = SKEmitterNode()
    private let confetti = SKEmitterNode()
    private let flareOverlay = SKSpriteNode(color: .clear, size: .zero)
    private let sceneCamera = SKCameraNode()

    override func didMove(to view: SKView) {
        backgroundColor = .clear
        camera = sceneCamera
        sceneCamera.position = CGPoint(x: size.width / 2, y: size.height / 2)
        addChild(sceneCamera)
        setupEmitters()
        flareOverlay.size = size
        flareOverlay.zPosition = 200
        flareOverlay.alpha = 0
        addChild(flareOverlay)
    }

    func updateIntensity(combo: Int) {
        dust.particleBirthRate = combo < 10 ? 12 : 22
        sparks.particleBirthRate = combo >= 10 ? CGFloat(16 + combo) : 0
        confetti.particleBirthRate = combo >= 20 ? CGFloat(24 + combo * 2) : 0

        if combo >= 40 {
            runFlareStrobe()
        }
    }

    func trigger(judge: JudgeResult, combo: Int) {
        guard judge != .miss else { return }

        spawnShockwave()

        if combo >= 30 {
            hypeLabel()
            cameraShake()
        }

        if combo >= 40 {
            prismFlash()
        }
    }

    private func setupEmitters() {
        [dust, sparks, confetti].forEach {
            $0.particlePositionRange = CGVector(dx: size.width * 0.75, dy: 40)
            $0.position = CGPoint(x: size.width / 2, y: size.height * 0.15)
            $0.particleLifetime = 1.4
            $0.particleSpeed = 120
            $0.particleScale = 0.08
            $0.particleAlpha = 0.9
            addChild($0)
        }

        dust.particleColor = .white
        sparks.particleColor = .orange
        confetti.particleColorBlendFactor = 1
        confetti.particleColorSequence = nil
        confetti.particleColor = .systemYellow
        confetti.particleLifetime = 2.4
    }

    private func spawnShockwave() {
        let ring = SKShapeNode(circleOfRadius: 40)
        ring.strokeColor = .cyan
        ring.lineWidth = 3
        ring.position = CGPoint(x: size.width / 2, y: size.height / 2)
        ring.glowWidth = 8
        ring.alpha = 0.8
        addChild(ring)

        let scale = SKAction.scale(to: 8, duration: 0.35)
        let fade = SKAction.fadeOut(withDuration: 0.35)
        ring.run(.sequence([.group([scale, fade]), .removeFromParent()]))
    }

    private func hypeLabel() {
        let label = SKLabelNode(text: "HYPE!")
        label.fontName = "AvenirNext-Heavy"
        label.fontSize = 56
        label.fontColor = .systemPink
        label.position = CGPoint(x: size.width / 2, y: size.height * 0.7)
        label.alpha = 0
        addChild(label)

        label.run(.sequence([
            .group([.fadeIn(withDuration: 0.08), .scale(to: 1.15, duration: 0.08)]),
            .wait(forDuration: 0.12),
            .fadeOut(withDuration: 0.25),
            .removeFromParent()
        ]))
    }

    private func cameraShake() {
        let moveA = SKAction.moveBy(x: 10, y: -6, duration: 0.03)
        let moveB = SKAction.moveBy(x: -20, y: 12, duration: 0.03)
        let moveC = SKAction.moveTo(x: size.width / 2, duration: 0.02)
        camera?.run(.sequence([moveA, moveB, moveA.reversed(), moveC]))
    }

    private func runFlareStrobe() {
        flareOverlay.removeAllActions()
        flareOverlay.color = .white
        flareOverlay.alpha = 0

        let pulse = SKAction.sequence([
            .fadeAlpha(to: 0.18, duration: 0.08),
            .fadeAlpha(to: 0.02, duration: 0.16)
        ])
        flareOverlay.run(.repeat(pulse, count: 2))
    }

    private func prismFlash() {
        let prism = SKSpriteNode(color: .cyan, size: size)
        prism.blendMode = .add
        prism.alpha = 0
        prism.position = CGPoint(x: size.width / 2, y: size.height / 2)
        addChild(prism)

        prism.run(.sequence([
            .fadeAlpha(to: 0.14, duration: 0.08),
            .colorize(with: .magenta, colorBlendFactor: 1, duration: 0.08),
            .colorize(with: .yellow, colorBlendFactor: 1, duration: 0.08),
            .fadeOut(withDuration: 0.16),
            .removeFromParent()
        ]))
    }
}

struct VFXOverlayView: View {
    @ObservedObject var coordinator: VFXCoordinator

    var body: some View {
        SpriteView(scene: coordinator.scene, options: [.allowsTransparency])
            .ignoresSafeArea()
            .allowsHitTesting(false)
    }
}
