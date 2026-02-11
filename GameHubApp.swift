import SwiftUI

@main
struct GameHubApp: App {
    @StateObject private var scoreStore = ScoreStore()

    var body: some Scene {
        WindowGroup {
            GameSelectionView()
                .environmentObject(scoreStore)
        }
    }
}
