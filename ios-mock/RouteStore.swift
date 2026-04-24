import Foundation

@MainActor
final class RouteStore: ObservableObject {
    @Published var state = RouteState() {
        didSet {
            state.rows = max(state.rows, 1)
            state.columns = max(state.columns, 1)
            state.routeCount = state.normalizedRouteCount
            save()
        }
    }

    private let fileName = "route_state.json"

    init() {
        load()
    }

    func applyGridConfig() {
        state.routeCount = state.normalizedRouteCount
        state.currentIndex = nil
        state.passedRoutes = []
    }

    func tapCell(at index: Int) {
        guard index < state.routeList.count else { return }
        state.currentIndex = index
        state.passedRoutes.append(state.routeList[index])
    }

    func resetRoute() {
        state.currentIndex = nil
        state.passedRoutes = []
    }

    func exportBundle() -> ExportBundle {
        let csvLines: [String] = ["index,route"] + state.passedRoutes.enumerated().map { "\($0.offset),\($0.element)" }
        let csv = csvLines.joined(separator: "\n")

        let markdownRows = state.passedRoutes.enumerated().map { "- route[\($0.offset)] = \($0.element)" }
        let markdown = """
        # Route Mock Export

        - rows: \(state.rows)
        - columns: \(state.columns)
        - routeCount: \(state.normalizedRouteCount)
        - current: \(state.currentIndex.map { String(state.routeList[$0]) } ?? "none")

        ## Passed History
        \(markdownRows.isEmpty ? "- (empty)" : markdownRows.joined(separator: "\n"))

        ## AI Draft
        \(state.aiOutputDraft.isEmpty ? "(empty)" : state.aiOutputDraft)
        """

        // 初期段階では Mermaid 記法をそのままテキスト表示する想定。
        let path = state.passedRoutes.map(String.init).joined(separator: " --> ")
        let mermaidText = "graph LR\n    \(path.isEmpty ? "Start" : path)"

        return ExportBundle(csv: csv, markdown: markdown, mermaidText: mermaidText)
    }

    private func load() {
        let url = fileURL()
        guard let data = try? Data(contentsOf: url) else { return }
        if let decoded = try? JSONDecoder().decode(RouteState.self, from: data) {
            state = decoded
            state.routeCount = state.normalizedRouteCount
        }
    }

    private func save() {
        let url = fileURL()
        if let data = try? JSONEncoder().encode(state) {
            try? data.write(to: url, options: .atomic)
        }
    }

    private func fileURL() -> URL {
        let base = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first
            ?? URL(fileURLWithPath: NSTemporaryDirectory())
        return base.appendingPathComponent(fileName)
    }
}
