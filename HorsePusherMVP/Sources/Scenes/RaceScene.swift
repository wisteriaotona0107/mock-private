import SpriteKit

final class RaceScene: SKScene {
    var onRaceFinished: ((RaceResult) -> Void)?

    private var horses: [Horse] = []
    private var horseNodes: [SKSpriteNode] = []
    private var isRacing = false

    override func didMove(to view: SKView) {
        scaleMode = .resizeFill
        backgroundColor = SKColor(red: 0.12, green: 0.37, blue: 0.17, alpha: 1.0)
        setupBackground()
    }

    private func setupBackground() {
        let highlight = SKSpriteNode(color: SKColor(red: 0.18, green: 0.49, blue: 0.25, alpha: 1.0), size: CGSize(width: size.width, height: size.height * 0.45))
        highlight.position = CGPoint(x: size.width / 2, y: size.height * 0.35)
        highlight.zPosition = -1
        addChild(highlight)

        let stand = SKSpriteNode(color: SKColor(white: 0.9, alpha: 0.2), size: CGSize(width: size.width, height: size.height * 0.25))
        stand.position = CGPoint(x: size.width / 2, y: size.height * 0.8)
        stand.zPosition = -2
        addChild(stand)
    }

    func startRace(with horses: [Horse]) {
        guard !isRacing else { return }
        isRacing = true
        self.horses = horses
        removeAllChildren()
        setupBackground()
        horseNodes.removeAll()
        createHorseNodes()
        runCameraMotion()
        startHorseRun()
    }

    private func createHorseNodes() {
        let laneHeight = size.height / CGFloat(max(horses.count, 1))
        for (index, horse) in horses.enumerated() {
            let node = SKSpriteNode(color: SKColor(red: 0.8, green: 0.8 - CGFloat(index) * 0.1, blue: 0.7, alpha: 1.0), size: CGSize(width: 60, height: laneHeight * 0.5))
            node.position = CGPoint(x: 80, y: laneHeight * (CGFloat(index) + 0.5))
            node.name = "horse-\(horse.id)"
            addChild(node)
            horseNodes.append(node)
        }
    }

    private func startHorseRun() {
        let finishLineX = size.width - 100
        for node in horseNodes {
            let duration = Double.random(in: 3.5...5.0)
            let moveAction = SKAction.moveTo(x: finishLineX, duration: duration)
            node.run(moveAction)
        }

        run(SKAction.sequence([
            SKAction.wait(forDuration: 5.2),
            SKAction.run { [weak self] in
                self?.finishRace()
            }
        ]))
    }

    private func finishRace() {
        let ranking = horses.shuffled()
        guard let winner = ranking.first else { return }
        isRacing = false
        onRaceFinished?(RaceResult(ranking: ranking, winningHorse: winner))
    }

    private func runCameraMotion() {
        let cameraNode = SKCameraNode()
        camera = cameraNode
        addChild(cameraNode)
        let zoomIn = SKAction.scale(to: 1.02, duration: 2.0)
        let zoomOut = SKAction.scale(to: 1.0, duration: 2.0)
        let panLeft = SKAction.moveBy(x: -10, y: 0, duration: 2.0)
        let panRight = SKAction.moveBy(x: 10, y: 0, duration: 2.0)
        cameraNode.run(SKAction.repeatForever(SKAction.sequence([zoomIn, zoomOut])))
        cameraNode.run(SKAction.repeatForever(SKAction.sequence([panLeft, panRight])))
    }
}
