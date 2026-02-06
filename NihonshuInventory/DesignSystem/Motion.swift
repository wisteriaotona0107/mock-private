import SwiftUI

enum Motion {
    static func fadeScale(reduceMotion: Bool) -> AnyTransition {
        if reduceMotion {
            return .opacity
        }
        return .opacity.combined(with: .scale(scale: 0.98))
    }

    static func emphasizedSpring(reduceMotion: Bool) -> Animation {
        if reduceMotion {
            return .easeInOut(duration: 0.2)
        }
        return .spring(response: 0.32, dampingFraction: 0.85, blendDuration: 0.1)
    }
}
