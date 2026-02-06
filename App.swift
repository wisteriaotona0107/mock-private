import SwiftUI

@main
struct LocalHistoryApp: App {
    @StateObject private var container = AppContainer()

    var body: some Scene {
        WindowGroup {
            RootView()
                .environmentObject(container)
                .task {
                    await container.bootstrap()
                }
        }
    }
}

@MainActor
final class AppContainer: ObservableObject {
    let settings = SettingsStore()
    let logger = LogStore()
    let repository: HistoryRepository

    @Published var appViewModel: AppViewModel?

    init() {
        repository = HistoryRepository()
    }

    func bootstrap() async {
        if appViewModel != nil { return }
        let vm = AppViewModel(repository: repository, logger: logger, settings: settings)
        appViewModel = vm
        await vm.initialize()
    }
}
