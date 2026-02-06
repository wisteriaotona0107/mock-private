import SwiftUI

struct PrimaryButton: View {
    @Environment(\.accessibilityReduceMotion) private var reduceMotion

    let title: String
    let action: () -> Void

    @State private var isPressed = false

    var body: some View {
        Button(action: handleTap) {
            Text(title)
                .font(Theme.Typography.headline)
                .foregroundStyle(Theme.Colors.paper)
                .frame(maxWidth: .infinity, minHeight: 44)
                .padding(.vertical, Theme.Spacing.xs)
                .background(
                    RoundedRectangle(cornerRadius: Theme.CornerRadius.sm, style: .continuous)
                        .fill(Theme.Colors.accent)
                )
        }
        .buttonStyle(.plain)
        .scaleEffect(isPressed && !reduceMotion ? 0.98 : 1)
        .animation(Motion.emphasizedSpring(reduceMotion: reduceMotion), value: isPressed)
        .pressAction { isPressed = true } onRelease: { isPressed = false }
    }

    private func handleTap() {
        let generator = UIImpactFeedbackGenerator(style: .soft)
        generator.impactOccurred()
        action()
    }
}

private struct PressAction: ViewModifier {
    let onPress: () -> Void
    let onRelease: () -> Void

    func body(content: Content) -> some View {
        content
            .gesture(
                DragGesture(minimumDistance: 0)
                    .onChanged { _ in onPress() }
                    .onEnded { _ in onRelease() }
            )
    }
}

private extension View {
    func pressAction(onPress: @escaping () -> Void, onRelease: @escaping () -> Void) -> some View {
        modifier(PressAction(onPress: onPress, onRelease: onRelease))
    }
}
