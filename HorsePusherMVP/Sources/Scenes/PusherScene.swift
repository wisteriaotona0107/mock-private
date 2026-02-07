import SpriteKit

final class PusherScene: SKScene, SKPhysicsContactDelegate {
    var onReward: ((PusherReward) -> Void)?
    var onLog: ((String) -> Void)?

    private let coinCategory: UInt32 = 0x1 << 0
    private let pocketCategory: UInt32 = 0x1 << 1

    override func didMove(to view: SKView) {
        scaleMode = .resizeFill
        backgroundColor = SKColor(red: 0.1, green: 0.29, blue: 0.18, alpha: 1.0)
        physicsWorld.gravity = CGVector(dx: 0, dy: -6.0)
        physicsWorld.contactDelegate = self
        setupBoard()
    }

    private func setupBoard() {
        removeAllChildren()
        let felt = SKSpriteNode(color: SKColor(red: 0.12, green: 0.35, blue: 0.2, alpha: 1.0), size: size)
        felt.position = CGPoint(x: size.width / 2, y: size.height / 2)
        felt.zPosition = -1
        addChild(felt)

        let lane = SKSpriteNode(color: SKColor(white: 1.0, alpha: 0.2), size: CGSize(width: size.width * 0.7, height: 4))
        lane.position = CGPoint(x: size.width / 2, y: size.height * 0.55)
        addChild(lane)

        let pocket = SKSpriteNode(color: SKColor(red: 0.78, green: 0.64, blue: 0.23, alpha: 1.0), size: CGSize(width: 80, height: 24))
        pocket.position = CGPoint(x: size.width / 2, y: 30)
        pocket.name = "pocket"
        pocket.physicsBody = SKPhysicsBody(rectangleOf: pocket.size)
        pocket.physicsBody?.isDynamic = false
        pocket.physicsBody?.categoryBitMask = pocketCategory
        pocket.physicsBody?.contactTestBitMask = coinCategory
        addChild(pocket)
    }

    override func touchesBegan(_ touches: Set<UITouch>, with event: UIEvent?) {
        guard let touch = touches.first else { return }
        dropCoin(at: touch.location(in: self))
    }

    private func dropCoin(at location: CGPoint) {
        let coin = SKShapeNode(circleOfRadius: 10)
        coin.fillColor = SKColor(red: 0.78, green: 0.64, blue: 0.23, alpha: 1.0)
        coin.strokeColor = .clear
        coin.position = CGPoint(x: location.x, y: size.height - 20)
        coin.name = "coin"
        coin.physicsBody = SKPhysicsBody(circleOfRadius: 10)
        coin.physicsBody?.categoryBitMask = coinCategory
        coin.physicsBody?.contactTestBitMask = pocketCategory
        coin.physicsBody?.restitution = 0.2
        addChild(coin)
        onLog?("Coin dropped.")
    }

    func didBegin(_ contact: SKPhysicsContact) {
        let categories = contact.bodyA.categoryBitMask | contact.bodyB.categoryBitMask
        if categories == (coinCategory | pocketCategory) {
            if let coin = contact.bodyA.node?.name == "coin" ? contact.bodyA.node : contact.bodyB.node {
                coin.removeFromParent()
            }
            triggerBoost()
        }
    }

    private func triggerBoost() {
        let flash = SKSpriteNode(color: SKColor(red: 0.78, green: 0.64, blue: 0.23, alpha: 0.4), size: size)
        flash.position = CGPoint(x: size.width / 2, y: size.height / 2)
        flash.zPosition = 10
        addChild(flash)
        flash.run(SKAction.sequence([
            SKAction.fadeOut(withDuration: 0.15),
            SKAction.removeFromParent()
        ]))
        onReward?(.boost)
        onLog?("Boost pocket triggered!")
    }
}
