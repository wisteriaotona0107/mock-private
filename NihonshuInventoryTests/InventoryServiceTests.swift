import XCTest
@testable import NihonshuInventory

final class InventoryServiceTests: XCTestCase {
    func testApplyOutReducesRemainingAndCreatesEvent() throws {
        let sake = Sake(name: "テスト酒")
        let lot = StockLot(sake: sake, bottleSizeMl: 720, opened: true, remainingMl: 500)

        try InventoryService.applyOut(lot: lot, amountMl: 120, note: "試飲")

        XCTAssertEqual(lot.remainingMl, 380)
        XCTAssertEqual(lot.events.count, 1)
        XCTAssertEqual(lot.events.first?.kind, "out")
        XCTAssertEqual(lot.events.first?.deltaMl, -120)
    }

    func testApplyAdjustSetsRemainingAndRecordsDelta() throws {
        let sake = Sake(name: "テスト酒")
        let lot = StockLot(sake: sake, bottleSizeMl: 1800, opened: false, remainingMl: 1600)

        try InventoryService.applyAdjust(lot: lot, to: 1500, note: "棚卸")

        XCTAssertEqual(lot.remainingMl, 1500)
        XCTAssertEqual(lot.events.first?.kind, "adjust")
        XCTAssertEqual(lot.events.first?.deltaMl, -100)
    }
}
