import SwiftUI

struct RootView: View {
    @EnvironmentObject private var container: AppContainer

    var body: some View {
        Group {
            if let vm = container.appViewModel {
                AdaptiveRootNavigation(viewModel: vm)
                    .environmentObject(container.settings)
            } else {
                ProgressView("初期化中...")
            }
        }
    }
}

private struct AdaptiveRootNavigation: View {
    @ObservedObject var viewModel: AppViewModel

    @State private var path = NavigationPath()

    var body: some View {
        if UIDevice.current.userInterfaceIdiom == .pad {
            NavigationSplitView {
                SidebarView(viewModel: viewModel)
            } detail: {
                HomeView(viewModel: viewModel)
            }
        } else {
            NavigationStack(path: $path) {
                SidebarView(viewModel: viewModel)
                    .navigationDestination(for: Destination.self) { destination in
                        switch destination {
                        case .home: HomeView(viewModel: viewModel)
                        case .historyList: HistoryListView(viewModel: viewModel)
                        case .settings: SettingsView(viewModel: viewModel)
                        case .debug: DebugView(viewModel: viewModel)
                        }
                    }
            }
            .environment(\.navigate, { path.append($0) })
        }
    }
}

enum Destination: Hashable {
    case home
    case historyList
    case settings
    case debug
}

private struct NavigateKey: EnvironmentKey {
    static let defaultValue: (Destination) -> Void = { _ in }
}

extension EnvironmentValues {
    var navigate: (Destination) -> Void {
        get { self[NavigateKey.self] }
        set { self[NavigateKey.self] = newValue }
    }
}

private struct SidebarView: View {
    @Environment(\.navigate) private var navigate

    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        List {
            NavigationLink("Home") { HomeView(viewModel: viewModel) }
            NavigationLink("History") { HistoryListView(viewModel: viewModel) }
            NavigationLink("Settings") { SettingsView(viewModel: viewModel) }
            NavigationLink("Debug") { DebugView(viewModel: viewModel) }

            if UIDevice.current.userInterfaceIdiom != .pad {
                Button("Open Home") { navigate(.home) }
                Button("Open History") { navigate(.historyList) }
                Button("Open Settings") { navigate(.settings) }
                Button("Open Debug") { navigate(.debug) }
            }
        }
        .listStyle(.sidebar)
        .navigationTitle("Menu")
    }
}
