import SwiftUI

@main
struct PoseMasterApp: App {
    @StateObject private var appState = AppState()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(appState)
        }
    }
}

final class AppState: ObservableObject {
    @Published var highScore: Int = UserDefaults.standard.integer(forKey: StorageKeys.highScore)

    func saveHighScore(_ value: Int) {
        guard value > highScore else { return }
        highScore = value
        UserDefaults.standard.set(value, forKey: StorageKeys.highScore)
    }
}

enum StorageKeys {
    static let highScore = "posemaster.highscore"
}
