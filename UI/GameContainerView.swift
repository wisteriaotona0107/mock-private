import SwiftUI

struct GameContainerView<Content: View>: View {
    let title: String
    let isPaused: Bool
    let canPause: Bool
    let instructions: String
    let onPauseToggle: () -> Void
    let onRestart: () -> Void
    let onExit: () -> Void
    @ViewBuilder var content: () -> Content

    var body: some View {
        VStack(spacing: 12) {
            header
            content()
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            Text(instructions)
                .font(.footnote)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)
                .padding(.bottom, 8)
        }
        .padding(.top, 8)
        .navigationBarBackButtonHidden(true)
    }

    private var header: some View {
        HStack(spacing: 10) {
            Text(title)
                .font(.title3.bold())
                .lineLimit(1)
            Spacer()
            if canPause {
                Button(isPaused ? "Resume" : "Pause", action: onPauseToggle)
                    .buttonStyle(.bordered)
            }
            Button("Restart", action: onRestart)
                .buttonStyle(.bordered)
            Button("Exit", role: .destructive, action: onExit)
                .buttonStyle(.bordered)
        }
        .padding(.horizontal)
    }
}
