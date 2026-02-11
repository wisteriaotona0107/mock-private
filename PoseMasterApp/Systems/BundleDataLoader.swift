import Foundation

struct BundleDataLoader {
    func loadPoses() -> [PoseDefinition] {
        guard let catalog: PoseCatalog = loadJSON(named: "poses") else {
            return Self.placeholderPoses
        }
        return catalog.poses
    }

    func loadRules() -> Rules {
        loadJSON(named: "rules") ?? .default
    }

    private func loadJSON<T: Decodable>(named fileName: String) -> T? {
        guard let url = Bundle.main.url(forResource: fileName, withExtension: "json") else {
            return nil
        }

        do {
            let data = try Data(contentsOf: url)
            return try JSONDecoder().decode(T.self, from: data)
        } catch {
            print("JSON load failure: \(fileName) \(error.localizedDescription)")
            return nil
        }
    }

    private static let placeholderPoses: [PoseDefinition] = [
        .init(id: "A", name: "Front Double Biceps", basePoint: 100, lane: .A, asset: .init(type: .imageSequence, name: "poseA")),
        .init(id: "B", name: "Side Chest", basePoint: 120, lane: .B, asset: .init(type: .imageSequence, name: "poseB")),
        .init(id: "C", name: "Back Double Biceps", basePoint: 150, lane: .C, asset: .init(type: .videoClip, name: "poseC_clip")),
        .init(id: "D", name: "Most Muscular", basePoint: 200, lane: .D, asset: .init(type: .imageSequence, name: "poseD")),
        .init(id: "S", name: "Finish Pose", basePoint: 260, lane: .S, asset: .init(type: .videoClip, name: "poseS_clip"))
    ]
}
