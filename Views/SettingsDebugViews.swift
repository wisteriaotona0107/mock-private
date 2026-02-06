import SwiftUI

struct SettingsView: View {
    @ObservedObject var viewModel: AppViewModel
    @EnvironmentObject private var settings: SettingsStore

    var body: some View {
        Form {
            Section("RBAC") {
                Picker("Role", selection: $settings.roleRawValue) {
                    ForEach(Role.allCases) { role in
                        Text(role.displayName).tag(role.rawValue)
                    }
                }
                .onChange(of: settings.roleRawValue) { _, _ in
                    Task { await viewModel.syncDebugConfig() }
                }

                Toggle("editLock", isOn: $settings.editLock)
            }

            Section {
                Text("編集可否: \(settings.accessContext.canEdit ? "可能" : "禁止")")
            }
        }
        .navigationTitle("Settings")
    }
}

struct DebugView: View {
    @ObservedObject var viewModel: AppViewModel
    @EnvironmentObject private var settings: SettingsStore

    var body: some View {
        VStack {
            Form {
                Section("疑似挙動") {
                    Toggle("疑似エラー", isOn: $settings.simulateError)
                    Toggle("疑似遅延", isOn: $settings.simulateDelay)
                    Stepper("遅延(ms): \(settings.delayMS)", value: $settings.delayMS, in: 0...5000, step: 100)
                }
                .onChange(of: settings.simulateError) { _, _ in
                    Task { await viewModel.syncDebugConfig() }
                }
                .onChange(of: settings.simulateDelay) { _, _ in
                    Task { await viewModel.syncDebugConfig() }
                }
                .onChange(of: settings.delayMS) { _, _ in
                    Task { await viewModel.syncDebugConfig() }
                }

                Section("ログ (最大500)") {
                    ForEach(viewModel.logs) { log in
                        VStack(alignment: .leading, spacing: 4) {
                            Text("[\(log.level)] \(log.timestamp.formatted(date: .omitted, time: .standard))")
                                .font(.caption)
                            Text(log.message)
                                .font(.caption2)
                        }
                    }
                }
            }
        }
        .task { await viewModel.refreshLogs() }
        .navigationTitle("Debug")
    }
}
