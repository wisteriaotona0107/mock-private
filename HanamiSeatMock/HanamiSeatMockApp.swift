import SwiftUI

@main
struct HanamiSeatMockApp: App {
    @StateObject private var viewModel = HanamiGameViewModel(store: LocalSessionStore())

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
        }
    }
}
