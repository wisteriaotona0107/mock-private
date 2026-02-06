import SwiftUI
import SwiftData

@main
struct NihonshuInventoryApp: App {
    var body: some Scene {
        WindowGroup {
            RootTabView()
        }
        .modelContainer(for: [Sake.self, StockLot.self, StockEvent.self])
    }
}
