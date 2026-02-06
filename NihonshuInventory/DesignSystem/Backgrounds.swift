import SwiftUI

struct WashiBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            LinearGradient(
                colors: gradientColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            NoiseOverlay()
        }
        .ignoresSafeArea()
    }

    private var gradientColors: [Color] {
        let base = Theme.Colors.paper
        let tint = Theme.Colors.accent.opacity(colorScheme == .dark ? 0.12 : 0.08)
        return [base, tint, base.opacity(0.98)]
    }
}

struct NoiseOverlay: View {
    var body: some View {
        Canvas { context, size in
            let dotSize: CGFloat = 1
            let columns = Int(size.width / dotSize)
            let rows = Int(size.height / dotSize)

            for x in 0..<columns {
                for y in 0..<rows {
                    if Int.random(in: 0...22) == 0 {
                        let rect = CGRect(
                            x: CGFloat(x) * dotSize,
                            y: CGFloat(y) * dotSize,
                            width: dotSize,
                            height: dotSize
                        )
                        context.fill(Path(rect), with: .color(.black.opacity(0.02)))
                    }
                }
            }
        }
        .blendMode(.overlay)
        .opacity(0.6)
        .accessibilityHidden(true)
    }
}
