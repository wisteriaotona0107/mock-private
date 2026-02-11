import Foundation
import Combine
import CoreGraphics

@MainActor
final class GameEngine: ObservableObject {
    @Published private(set) var score: Int = 0
    @Published private(set) var combo: Int = 0
    @Published private(set) var timeRemaining: Double = 60
    @Published private(set) var judgeText: String = "READY"
    @Published private(set) var stageShake: CGFloat = 0
    @Published private(set) var finished = false
    @Published private(set) var latestPoseID: String = "A"

    private(set) var notes: [Note] = []

    private let rules: Rules
    private let poses: [PoseDefinition]
    private let poseByLane: [Lane: PoseDefinition]
    private var startTime: CFTimeInterval = 0
    private var displayLinkTimer: Timer?

    var onJudge: ((JudgeResult, Int) -> Void)?

    init(rules: Rules, poses: [PoseDefinition]) {
        self.rules = rules
        self.poses = poses
        self.poseByLane = Dictionary(uniqueKeysWithValues: poses.map { ($0.lane, $0) })
        self.timeRemaining = rules.durationSeconds
        self.notes = Self.generateBeatMap(duration: rules.durationSeconds, noteCount: rules.noteCount, poses: poses)
    }

    func start() {
        score = 0
        combo = 0
        judgeText = "GO"
        finished = false
        timeRemaining = rules.durationSeconds
        notes = Self.generateBeatMap(duration: rules.durationSeconds, noteCount: rules.noteCount, poses: poses)

        startTime = CACurrentMediaTime()
        displayLinkTimer?.invalidate()
        displayLinkTimer = Timer.scheduledTimer(withTimeInterval: 1.0 / 60.0, repeats: true) { [weak self] _ in
            Task { @MainActor in self?.tick() }
        }
    }

    func stop() {
        displayLinkTimer?.invalidate()
        displayLinkTimer = nil
    }

    func hit(lane: Lane) {
        guard !finished else { return }
        let now = elapsedTime
        guard let idx = notes.firstIndex(where: { !$0.isHit && $0.lane == lane }) else {
            registerMiss()
            return
        }

        let deltaMs = abs((notes[idx].time - now) * 1_000)
        let judge: JudgeResult

        if deltaMs <= rules.perfectMs {
            judge = .perfect
        } else if deltaMs <= rules.greatMs {
            judge = .great
        } else if deltaMs <= rules.goodMs {
            judge = .good
        } else {
            registerMiss()
            return
        }

        notes[idx].isHit = true
        combo += 1
        judgeText = judge.rawValue

        let pose = poseByLane[lane] ?? poses[0]
        latestPoseID = pose.id
        score += scoreFor(pose: pose, judge: judge)

        let bonus = sequenceBonus(now: now)
        if bonus > 0 { score += bonus }

        if timeRemaining <= rules.finishWindowSeconds, lane == .S {
            score += 500
            judgeText = "FINISH BONUS"
        }

        stageShake = combo >= 30 ? min(CGFloat(combo) * 0.08, 8) : 0
        onJudge?(judge, combo)
    }

    private func registerMiss() {
        combo = 0
        judgeText = JudgeResult.miss.rawValue
        onJudge?(.miss, combo)
    }

    private func scoreFor(pose: PoseDefinition, judge: JudgeResult) -> Int {
        let comboMult = ComboTier.defaults.last(where: { combo >= $0.minCombo })?.scoreMultiplier ?? 1.0
        return Int(Double(pose.basePoint) * judge.multiplier * comboMult)
    }

    private func sequenceBonus(now: CFTimeInterval) -> Int {
        let recent = notes
            .filter(\.isHit)
            .sorted { $0.time > $1.time }
            .prefix(3)
            .map(\.lane)

        if recent.count == 3, recent.elementsEqual([.A, .B, .C]) {
            return 150
        }

        if recent.count == 3, recent.elementsEqual([.D, .C, .B]), now > rules.durationSeconds * 0.6 {
            return 250
        }
        return 0
    }

    private var elapsedTime: CFTimeInterval {
        CACurrentMediaTime() - startTime
    }

    private func tick() {
        let elapsed = elapsedTime
        timeRemaining = max(0, rules.durationSeconds - elapsed)

        for index in notes.indices where !notes[index].isHit {
            let missMs = (elapsed - notes[index].time) * 1_000
            if missMs > rules.goodMs {
                notes[index].isHit = true
                registerMiss()
            } else {
                break
            }
        }

        if elapsed >= rules.durationSeconds {
            finished = true
            judgeText = "TIME UP"
            stop()
        }
    }

    private static func generateBeatMap(duration: Double, noteCount: Int, poses: [PoseDefinition]) -> [Note] {
        guard noteCount > 0 else { return [] }

        let lanes = poses.map(\.lane)
        let spacing = duration / Double(noteCount)
        return (0..<noteCount).map { i in
            let lane = lanes[(i * 7 + 3) % lanes.count]
            let poseId = poses.first(where: { $0.lane == lane })?.id ?? poses[0].id
            return Note(lane: lane, time: Double(i) * spacing + 0.7, poseId: poseId)
        }
    }
}
