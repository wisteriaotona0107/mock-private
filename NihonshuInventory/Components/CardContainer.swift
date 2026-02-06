import SwiftUI

struct CardContainer<Content: View>: View {
    let content: Content

    init(@ViewBuilder content: () -> Content) {
        self.content = content()
    }

    var body: some View {
        content
            .padding(Theme.Spacing.md)
            .background(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.md, style: .continuous)
                    .fill(Theme.Colors.paper.opacity(0.9))
            )
            .overlay(
                RoundedRectangle(cornerRadius: Theme.CornerRadius.md, style: .continuous)
                    .stroke(Theme.DividerStyle.color, lineWidth: Theme.DividerStyle.height)
            )
            .shadow(color: Theme.Shadow.light, radius: Theme.Shadow.radius, x: 0, y: Theme.Shadow.y)
    }
}
