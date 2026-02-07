import Foundation
import SpriteKit

final class GameViewModel: ObservableObject {
    @Published var state: GameState = .idle
    @Published var coins: Int = 0
    @Published var betAmount: Int = 0
    @Published var selectedHorse: Horse?
    @Published var multiplier: Double = 1.0
    @Published var logs: [LogEntry] = []
    @Published var lastResult: RaceResult?
    @Published var lastPayout: Int = 0
    @Published var bestPayout: Int = 0

    let config: GameConfig
    let horses: [Horse]
    let items: [Item]

    let raceScene: RaceScene
    let pusherScene: PusherScene

    private let dataStore = DataStore.shared

    init() {
        self.config = JSONLoader.load("GameConfig.json")
        self.horses = JSONLoader.load("HorseData.json")
        self.items = JSONLoader.load("ItemData.json")
        self.coins = dataStore.loadCoins(defaultValue: config.baseCoins)
        self.bestPayout = dataStore.loadBestPayout()
        self.raceScene = RaceScene(size: CGSize(width: 1024, height: 512))
        self.pusherScene = PusherScene(size: CGSize(width: 1024, height: 384))
        configureScenes()
        addLog("Welcome back to the track.")
    }

    private func configureScenes() {
        raceScene.onRaceFinished = { [weak self] result in
            DispatchQueue.main.async {
                self?.handleRaceFinished(result)
            }
        }
        pusherScene.onReward = { [weak self] reward in
            DispatchQueue.main.async {
                self?.handlePusherReward(reward)
            }
        }
        pusherScene.onLog = { [weak self] message in
            DispatchQueue.main.async {
                self?.addLog(message)
            }
        }
    }

    func selectHorse(_ horse: Horse) {
        selectedHorse = horse
        state = .betting
        addLog("Selected \(horse.name).")
    }

    func addBet(amount: Int) {
        betAmount = max(0, betAmount + amount)
    }

    func resetBet() {
        betAmount = 0
    }

    func placeBet() {
        guard state != .racing else { return }
        guard let selectedHorse else {
            addLog("Pick a horse first.")
            return
        }
        guard betAmount > 0 else {
            addLog("Add bet amount.")
            return
        }
        guard coins >= betAmount else {
            addLog("Not enough coins.")
            return
        }
        coins -= betAmount
        dataStore.saveCoins(coins)
        state = .racing
        addLog("BET placed on \(selectedHorse.name).")
        raceScene.startRace(with: horses)
    }

    func startNewRound() {
        state = .idle
        betAmount = 0
        multiplier = 1.0
        lastResult = nil
        lastPayout = 0
        addLog("Ready for the next race.")
    }

    func handlePusherReward(_ reward: PusherReward) {
        switch reward {
        case .boost:
            multiplier = min(multiplier + config.boostAmount, config.multiplierMax)
            addLog("Boost! Multiplier is now x\(String(format: "%.1f", multiplier)).")
        case .lucky:
            addLog("Lucky bonus pending.")
        case .insurance:
            addLog("Insurance pending.")
        }
    }

    private func handleRaceFinished(_ result: RaceResult) {
        lastResult = result
        guard let selectedHorse else {
            state = .result
            return
        }
        let isWin = result.winningHorse.id == selectedHorse.id
        let odds = selectedHorse.odds
        let payout = isWin ? Int(Double(betAmount) * odds * multiplier) : 0
        lastPayout = payout
        if payout > 0 {
            coins += payout
            addLog("Payout +\(payout) coins.")
        } else {
            addLog("No payout this race.")
        }
        if payout > bestPayout {
            bestPayout = payout
            dataStore.saveBestPayout(bestPayout)
        }
        dataStore.saveCoins(coins)
        state = .result
    }

    func addLog(_ message: String) {
        logs.insert(LogEntry(message: message), at: 0)
        if logs.count > 5 {
            logs = Array(logs.prefix(5))
        }
    }
}
