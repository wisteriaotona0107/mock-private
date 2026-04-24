import SwiftUI

@main
struct RouteMockApp: App {
    @StateObject private var store = RouteStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
        }
    }
}
