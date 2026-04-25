import Foundation

enum ParkType: String, CaseIterable, Codable, Identifiable {
    case small = "小規模公園"
    case medium = "中規模公園"
    case famous = "桜の名所"

    var id: String { rawValue }

    var congestionBase: [Double] {
        switch self {
        case .small: return [0.30, 0.72, 0.52]
        case .medium: return [0.50, 0.80, 0.58]
        case .famous: return [0.74, 0.95, 0.78]
        }
    }
}

enum TimeSlot: String, CaseIterable, Codable, Identifiable {
    case morning = "朝"
    case noon = "昼"
    case night = "夜"

    var id: String { rawValue }
}

enum SheetSize: String, CaseIterable, Codable, Identifiable {
    case two = "2人用"
    case four = "4人用"
    case six = "6人用"

    var id: String { rawValue }
    var capacity: Int {
        switch self {
        case .two: return 2
        case .four: return 4
        case .six: return 6
        }
    }
}

struct ScoreBreakdown: Codable {
    var blossom: Double
    var space: Double
    var congestion: Double

    var total: Double {
        0.45 * blossom + 0.35 * space + 0.20 * congestion
    }

    var total100: Int {
        Int((total * 20).rounded())
    }
}

struct SessionRecord: Identifiable, Codable {
    var id: UUID
    var createdAt: Date
    var title: String
    var parkType: ParkType
    var timeSlot: TimeSlot
    var participants: Int
    var sheetSize: SheetSize
    var aiMemo: String
    var mermaidText: String
    var score: ScoreBreakdown

    static let empty = SessionRecord(
        id: UUID(),
        createdAt: .now,
        title: "新しい席取り",
        parkType: .medium,
        timeSlot: .morning,
        participants: 4,
        sheetSize: .four,
        aiMemo: "",
        mermaidText: "graph TD\nA[開始]-->B[席取り評価]",
        score: .init(blossom: 3.0, space: 3.0, congestion: 3.0)
    )
}
