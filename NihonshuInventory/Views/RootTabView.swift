import SwiftUI

struct RootTabView: View {
    var body: some View {
        TabView {
            NavigationStack {
                InventoryListView()
            }
            .tabItem {
                Label("在庫", systemImage: "shippingbox")
            }

            NavigationStack {
                SakeManagementView()
            }
            .tabItem {
                Label("銘柄", systemImage: "wineglass")
            }
        }
    }
}
