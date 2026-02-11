import SwiftUI

struct GameTileView: View {
    let game: GameID
    let record: ScoreRecord

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(game.title)
                .font(.headline)
                .foregroundStyle(.white)
            Text(game.shortDescription)
                .font(.caption)
                .foregroundStyle(.white.opacity(0.9))
                .lineLimit(2)
            Spacer()
            Text("Best: \(record.best)")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.white)
            Text("Plays: \(record.plays)")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.9))
        }
        .padding()
        .frame(maxWidth: .infinity, minHeight: 150, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(LinearGradient(colors: [.indigo, .cyan], startPoint: .topLeading, endPoint: .bottomTrailing))
        )
    }
}
