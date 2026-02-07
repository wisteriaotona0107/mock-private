# 組み込み向けトレーサビリティWebモック

バニラ HTML/CSS/JavaScript だけで動作する、オフライン向けの簡易トレーサビリティビューアです。localStorage と JSON で状態を保持し、抜粋ログを貼り付けて証跡として閲覧できます。

## 特徴
- **TeraTerm（時刻付きログ）**と**tcpdump -x（hexのみダンプ）**の inline 表示に対応
- localStorage 保存 / JSON import/export 互換
- 検索（部分一致）・該当行のみ表示・ハイライト・異常ワード抽出
- 大規模ログ対策（先頭100行表示 + 全文表示切り替え）

## 前提フォーマット
### TeraTermログ（時刻あり）
```
[2026-02-07 13:21:01.123] UART RX: 0x02 0x10 0x00 0x01
[2026-02-07 13:21:01.125] UART TX: ACK
[2026-02-07 13:21:02.004] ERROR: timeout waiting response
```

### tcpdump -x（hexのみ）
```
14:32:01.123456 IP 192.168.0.10.5000 > 192.168.0.20.502: UDP, length 32
        0x0000:  4500 003c 1c46 4000 4011 b861 c0a8 000a
        0x0010:  c0a8 0014 1388 01f6 0028 0000 0210 0001
```

> **注意**: 本ツールは **tcpdump -x のhexダンプのみ**を対象とします。ASCII列（`-X` など）は扱いません。

## 使い方
1. `index.html` をブラウザで開く（オフライン動作）
2. 左側で Step を選択
3. 証跡をクリックしてログビューを表示
4. 上部の検索や「異常ワード抽出」で絞り込み

## 抜粋貼付方式（実機ログからの例）
ローカルファイル自動読込は必須にせず、**抜粋貼付方式**で利用します。

### TeraTerm 例
```bash
# 例: UART関連だけ抜粋して貼り付け
grep -E 'UART|ERROR|RETRY|timeout' teraterm.log
```

### tcpdump 例
```bash
# 例: UDP 502番ポートのhexダンプを取得
sudo tcpdump -i eth0 -x udp port 502
```

## データモデル拡張（evidences）
```json
{
  "contentMode": "inline",
  "inlineText": "...",
  "format": "teraterm",
  "tool": "TeraTerm",
  "extractionHint": "grep -E 'UART|ERROR'"
}
```

## ファイル構成
- `index.html`
- `styles.css`
- `app.js`
- `sample_data.json`
