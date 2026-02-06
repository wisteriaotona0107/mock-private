import SwiftUI

enum Theme {
    enum Spacing {
        static let xs: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
    }

    enum CornerRadius {
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 24
    }

    enum Shadow {
        static let light = Color.black.opacity(0.08)
        static let radius: CGFloat = 10
        static let y: CGFloat = 4
    }

    enum DividerStyle {
        static let color = Color.primary.opacity(0.08)
        static let height: CGFloat = 1
    }

    enum Typography {
        static let title = Font.title2.weight(.semibold)
        static let headline = Font.headline.weight(.semibold)
        static let body = Font.body
    }

    enum Colors {
        static let ink = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark ? UIColor(white: 0.95, alpha: 1) : UIColor(white: 0.08, alpha: 1)
        })
        static let paper = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark ? UIColor(white: 0.08, alpha: 1) : UIColor(red: 0.98, green: 0.97, blue: 0.94, alpha: 1)
        })
        static let accent = Color(uiColor: UIColor { trait in
            trait.userInterfaceStyle == .dark ? UIColor(red: 0.35, green: 0.57, blue: 0.6, alpha: 1) : UIColor(red: 0.12, green: 0.35, blue: 0.42, alpha: 1)
        })
    }
}
