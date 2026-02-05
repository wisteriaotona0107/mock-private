import Foundation
import SwiftData

@Model
final class Sake {
    var id: UUID
    @Attribute(.unique) var name: String
    var brewery: String?
    var type: String?
    var memo: String?
    var createdAt: Date
    var updatedAt: Date

    @Relationship(inverse: \StockLot.sake)
    var lots: [StockLot]

    init(
        id: UUID = UUID(),
        name: String,
        brewery: String? = nil,
        type: String? = nil,
        memo: String? = nil,
        createdAt: Date = .now,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.name = name
        self.brewery = brewery
        self.type = type
        self.memo = memo
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.lots = []
    }
}
