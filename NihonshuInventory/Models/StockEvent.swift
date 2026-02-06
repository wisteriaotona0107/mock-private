import Foundation
import SwiftData

@Model
final class StockEvent {
    var id: UUID
    var lot: StockLot
    var kind: String
    var deltaMl: Int
    var note: String?
    var at: Date

    init(
        id: UUID = UUID(),
        lot: StockLot,
        kind: String,
        deltaMl: Int,
        note: String? = nil,
        at: Date = .now
    ) {
        self.id = id
        self.lot = lot
        self.kind = kind
        self.deltaMl = deltaMl
        self.note = note
        self.at = at
    }
}
