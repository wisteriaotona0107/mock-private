# Traceability Studio (Embedded QA Mock)

組み込み開発向けの「要件 → 設計 → 試験 → 証跡」を一気通貫で追えるオフラインWebモックです。FW/RTOS/Driver開発と評価・検証の現場でよくある UART/CAN/ETH/Boot/RTOS の要件とエビデンス管理を想定しています。

## 起動方法
1. 本リポジトリを展開します。
2. `index.html` をブラウザで直接開きます。（オフライン動作 / ビルド不要）

## JSON import / export
- **Export**: 画面右上の `JSON Export` をクリックすると、現在のデータが `traceability_export.json` として保存されます。
- **Import**: `JSON Import` から JSON ファイルを選択するとデータを読み込みます。壊れたJSONの場合はトーストでエラー表示します。
- 初期データに戻したい場合は `サンプル投入` をクリックします。

## 組み込み想定シナリオとサンプルデータ
- **UART**: 連続ログ出力でRingBufferが溢れて欠落する異常系、タイムアウト再送の回数超過。
- **CAN**: 受信IDフィルタリングの合否確認。
- **ETH**: UDPロス率のFailケース。
- **RTOS**: タスク遅延監視、未解析の証跡あり。
- **Boot / Power / Memory**: 起動時間、低電圧検知、DMAオーバーラン検知の試験と証跡。

これらのデータは `sample_data.json` にも保存しているため、外部共有やテンプレートとして利用できます。

## 操作デモ手順（例）
1. `Dashboard` で Fail件数と未紐付け件数を確認。
2. `Testcases` で Fail の試験（例: `TC-UART-010`）を選択して編集。
3. `Evidences` で該当証跡を開き、相対パスのコピーボタンをクリック。
4. `Traceability` で要件→設計→試験→証跡のツリーと孤立検知を確認。
5. `JSON Export` で成果物を保存。

## 将来拡張案
- pcap / csv の簡易ビューア（フィルタ・列選択）
- ログgrep支援 UI（正規表現・保存フィルタ）
- tshark抽出支援（GUIでfilter生成）
- 証跡の差分比較（バージョン間のFail原因特定）
