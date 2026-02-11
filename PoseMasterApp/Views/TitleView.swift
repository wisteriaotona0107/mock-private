import SwiftUI

struct TitleView: View {
    let highScore: Int
    let onStart: () -> Void

    var body: some View {
        VStack(spacing: 26) {
            Spacer()
            Text("POSE MASTER")
                .font(.system(size: 52, weight: .black, design: .rounded))
                .foregroundStyle(
                    LinearGradient(colors: [.yellow, .red, .cyan], startPoint: .leading, endPoint: .trailing)
                )
                .shadow(color: .yellow.opacity(0.5), radius: 18)

            Text("Stage of Iron")
                .font(.title2.weight(.semibold))
                .foregroundStyle(.white.opacity(0.9))

            GlassPanel {
                VStack(spacing: 8) {
                    Text("BEST SCORE")
                        .font(.caption)
                        .foregroundStyle(.white.opacity(0.8))
                    Text("\(highScore)")
                        .font(.system(size: 44, weight: .heavy, design: .rounded))
                        .foregroundStyle(.white)
                }
            }
            .frame(maxWidth: 360)

            Button("Start Show") { onStart() }
                .buttonStyle(.borderedProminent)
                .tint(.red)
                .font(.title3.bold())

            Spacer()
            Text("Offline • iPhone + iPad")
                .font(.footnote)
                .foregroundStyle(.white.opacity(0.6))
        }
        .padding(24)
    }
}
