import Foundation

struct RouteState: Codable {
    var rows: Int = 4
    var columns: Int = 5
    var routeCount: Int = 18
    var currentIndex: Int? = nil
    var passedRoutes: [Int] = []
    var aiOutputDraft: String = ""

    var totalCells: Int { rows * columns }

    var normalizedRouteCount: Int {
        min(max(routeCount, 1), max(totalCells, 1))
    }

    var routeList: [Int] {
        Array(1...normalizedRouteCount)
    }
}

struct ExportBundle {
    let csv: String
    let markdown: String
    let mermaidText: String
}
