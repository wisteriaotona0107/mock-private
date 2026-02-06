import SwiftUI

struct EmptyStateView: View {
    let title: String
    let message: String
    let systemImage: String
    let actionTitle: String?
    let action: (() -> Void)?

    var body: some View {
        VStack(spacing: Theme.Spacing.md) {
            Image(systemName: systemImage)
                .font(.system(size: 42))
                .foregroundStyle(Theme.Colors.accent)
            Text(title)
                .font(Theme.Typography.title)
                .foregroundStyle(Theme.Colors.ink)
            Text(message)
                .font(Theme.Typography.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)

            if let actionTitle, let action {
                PrimaryButton(title: actionTitle, action: action)
                    .frame(maxWidth: 240)
            }
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity)
    }
}

struct ErrorStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            Image(systemName: "exclamationmark.triangle")
                .font(.system(size: 36))
                .foregroundStyle(.orange)
            Text("エラー")
                .font(Theme.Typography.headline)
            Text(message)
                .font(Theme.Typography.body)
                .foregroundStyle(.secondary)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity)
    }
}

struct LoadingStateView: View {
    let message: String

    var body: some View {
        VStack(spacing: Theme.Spacing.sm) {
            ProgressView()
            Text(message)
                .font(Theme.Typography.body)
                .foregroundStyle(.secondary)
        }
        .padding(Theme.Spacing.lg)
        .frame(maxWidth: .infinity)
    }
}
