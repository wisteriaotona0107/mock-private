import Foundation
import SwiftData

@Model
final class StockLot {
    var id: UUID
    var sake: Sake
    var location: String?
    var bottleSizeMl: Int
    var opened: Bool
    var remainingMl: Int
    var updatedAt: Date

    @Relationship(deleteRule: .cascade, inverse: \StockEvent.lot)
    var events: [StockEvent]

    init(
        id: UUID = UUID(),
        sake: Sake,
        location: String? = nil,
        bottleSizeMl: Int,
        opened: Bool,
        remainingMl: Int,
        updatedAt: Date = .now
    ) {
        self.id = id
        self.sake = sake
        self.location = location
        self.bottleSizeMl = bottleSizeMl
        self.opened = opened
        self.remainingMl = max(0, min(remainingMl, bottleSizeMl))
        self.updatedAt = updatedAt
        self.events = []
    }
}
