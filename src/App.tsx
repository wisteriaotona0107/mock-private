import { useEffect, useMemo, useState } from "react";
import type { SKU } from "./models/sku.schema";
import type { Bottle } from "./models/bottle.schema";
import type { TempLog } from "./models/temp_log.schema";
import {
  addEvent,
  addTempLogs,
  fridgeId,
  getBottle,
  getBottles,
  getMeta,
  getSkus,
  getTempLogs,
  seedDefaultSkus,
  setMeta,
  upsertBottle,
  upsertSku,
} from "./services/db";
import {
  calculateQuality,
  generateCustomerComment,
  type QualityResult,
} from "./services/quality";
import { buildTempLogs, parseCsv, type CsvPreview } from "./services/csvImport";
import QualityBadge from "./components/QualityBadge";
import Sparkline from "./components/Sparkline";

const nowIso = () => new Date().toISOString();

type Page =
  | "home"
  | "scan"
  | "sku"
  | "bottle-list"
  | "bottle-detail"
  | "import";

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [skus, setSkus] = useState<SKU[]>([]);
  const [bottles, setBottles] = useState<Bottle[]>([]);
  const [tempLogs, setTempLogs] = useState<TempLog[]>([]);
  const [selectedBottle, setSelectedBottle] = useState<Bottle | null>(null);
  const [lastImportAt, setLastImportAt] = useState<string | null>(null);

  const refresh = async () => {
    const [skuData, bottleData, logData, lastImport] = await Promise.all([
      getSkus(),
      getBottles(),
      getTempLogs(fridgeId),
      getMeta("lastImportAt"),
    ]);
    setSkus(skuData);
    setBottles(bottleData);
    setTempLogs(logData);
    setLastImportAt(lastImport);
  };

  useEffect(() => {
    seedDefaultSkus().then(refresh);
  }, []);

  const handleCreateSku = async (input: Omit<SKU, "created_at" | "updated_at">) => {
    const timestamp = nowIso();
    await upsertSku({
      ...input,
      created_at: timestamp,
      updated_at: timestamp,
    });
    await refresh();
  };

  const handleCreateBottle = async (bottleId: string, skuId: string) => {
    const timestamp = nowIso();
    await upsertBottle({
      bottle_id: bottleId,
      sku_id: skuId,
      fridge_id: fridgeId,
      created_at: timestamp,
      updated_at: timestamp,
    });
    await refresh();
  };

  const handleOpenBottle = async (bottle: Bottle) => {
    const timestamp = nowIso();
    await upsertBottle({
      ...bottle,
      opened_at: bottle.opened_at ?? timestamp,
      updated_at: timestamp,
    });
    await addEvent({
      event_id: `event-${timestamp}`,
      ts: timestamp,
      type: "OPEN",
      bottle_id: bottle.bottle_id,
    });
    await refresh();
  };

  const handleEmptyBottle = async (bottle: Bottle) => {
    const timestamp = nowIso();
    await upsertBottle({
      ...bottle,
      emptied_at: timestamp,
      updated_at: timestamp,
    });
    await addEvent({
      event_id: `event-${timestamp}`,
      ts: timestamp,
      type: "EMPTY",
      bottle_id: bottle.bottle_id,
    });
    await refresh();
  };

  const handleSelectBottle = async (bottleId: string) => {
    const bottle = await getBottle(bottleId);
    setSelectedBottle(bottle ?? null);
    setPage("bottle-detail");
  };

  const handleCsvImport = async (
    preview: CsvPreview,
    timestampIndex: number,
    tempIndex: number
  ) => {
    const logs = buildTempLogs(preview, timestampIndex, tempIndex);
    await addTempLogs(logs);
    const timestamp = nowIso();
    await setMeta("lastImportAt", timestamp);
    await refresh();
  };

  const selectedSku = useMemo(() => {
    if (!selectedBottle) return null;
    return skus.find((sku) => sku.sku_id === selectedBottle.sku_id) ?? null;
  }, [selectedBottle, skus]);

  const qualityResult: QualityResult | null = useMemo(() => {
    if (!selectedBottle || !selectedSku) return null;
    return calculateQuality(selectedBottle, selectedSku, tempLogs);
  }, [selectedBottle, selectedSku, tempLogs]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>酒質ログ</h1>
        <div className="nav">
          <button onClick={() => setPage("home")}>ホーム</button>
          <button onClick={() => setPage("scan")}>QRスキャン</button>
          <button onClick={() => setPage("import")}>温度CSV取込</button>
          <button onClick={() => setPage("bottle-list")}>ボトル一覧</button>
          <button onClick={() => setPage("sku")}>銘柄管理</button>
        </div>
      </header>

      <main className="app-main">
        {page === "home" && (
          <section className="card">
            <h2>ホーム</h2>
            <p>ローカルファーストで酒質管理を行います。</p>
            <div className="grid">
              <button onClick={() => setPage("scan")}>QRスキャン</button>
              <button onClick={() => setPage("import")}>温度CSV取込</button>
              <button onClick={() => setPage("bottle-list")}>ボトル一覧</button>
              <button onClick={() => setPage("sku")}>銘柄管理</button>
            </div>
            <div className="meta">
              最終ログ取込日時: {lastImportAt ?? "未取込"}
            </div>
          </section>
        )}

        {page === "scan" && (
          <QrScanPage
            skus={skus}
            bottles={bottles}
            onCreateBottle={handleCreateBottle}
            onOpenBottle={handleOpenBottle}
            onEmptyBottle={handleEmptyBottle}
          />
        )}

        {page === "sku" && (
          <SkuManagementPage skus={skus} onCreateSku={handleCreateSku} />
        )}

        {page === "bottle-list" && (
          <BottleListPage
            bottles={bottles}
            skus={skus}
            onSelect={handleSelectBottle}
          />
        )}

        {page === "bottle-detail" && selectedBottle && selectedSku && qualityResult && (
          <BottleDetailPage
            bottle={selectedBottle}
            sku={selectedSku}
            tempLogs={tempLogs}
            result={qualityResult}
            comment={generateCustomerComment(qualityResult, selectedSku)}
            onOpen={() => handleOpenBottle(selectedBottle)}
            onEmpty={() => handleEmptyBottle(selectedBottle)}
          />
        )}

        {page === "import" && (
          <TempImportPage onImport={handleCsvImport} />
        )}
      </main>
    </div>
  );
}

function QrScanPage({
  skus,
  bottles,
  onCreateBottle,
  onOpenBottle,
  onEmptyBottle,
}: {
  skus: SKU[];
  bottles: Bottle[];
  onCreateBottle: (bottleId: string, skuId: string) => void;
  onOpenBottle: (bottle: Bottle) => void;
  onEmptyBottle: (bottle: Bottle) => void;
}) {
  const [bottleId, setBottleId] = useState("");
  const [selectedSku, setSelectedSku] = useState("");
  const bottle = bottles.find((item) => item.bottle_id === bottleId) ?? null;
  const sku = skus.find((item) => item.sku_id === bottle?.sku_id) ?? null;

  return (
    <section className="card">
      <h2>QRスキャン</h2>
      <p className="hint">カメラがない場合は手入力で代用できます。</p>
      <label>
        ボトルID
        <input
          value={bottleId}
          onChange={(event) => setBottleId(event.target.value)}
          placeholder="例: BTL-001"
        />
      </label>

      {bottle && sku && (
        <div className="panel">
          <div>銘柄名: {sku.name_ja}</div>
          <div className="button-row">
            <button onClick={() => onOpenBottle(bottle)}>開栓</button>
            <button onClick={() => onEmptyBottle(bottle)}>空き</button>
          </div>
        </div>
      )}

      {!bottle && bottleId && (
        <div className="panel">
          <label>
            銘柄選択
            <select
              value={selectedSku}
              onChange={(event) => setSelectedSku(event.target.value)}
            >
              <option value="">選択してください</option>
              {skus.map((item) => (
                <option key={item.sku_id} value={item.sku_id}>
                  {item.name_ja}
                </option>
              ))}
            </select>
          </label>
          <button
            onClick={() => {
              if (selectedSku) {
                onCreateBottle(bottleId, selectedSku);
                setSelectedSku("");
              }
            }}
            disabled={!selectedSku}
          >
            新規ボトル作成
          </button>
        </div>
      )}
    </section>
  );
}

function SkuManagementPage({
  skus,
  onCreateSku,
}: {
  skus: SKU[];
  onCreateSku: (sku: Omit<SKU, "created_at" | "updated_at">) => void;
}) {
  const [form, setForm] = useState({
    sku_id: "",
    name_ja: "",
    type: "junmai",
    min: "4",
    max: "8",
    type_weight: "2",
    light_sensitive: "medium",
    notes: "",
  });

  return (
    <section className="card">
      <h2>銘柄管理</h2>
      <div className="form-grid">
        <label>
          SKU ID
          <input
            value={form.sku_id}
            onChange={(event) => setForm({ ...form, sku_id: event.target.value })}
          />
        </label>
        <label>
          銘柄名
          <input
            value={form.name_ja}
            onChange={(event) => setForm({ ...form, name_ja: event.target.value })}
          />
        </label>
        <label>
          種別
          <select
            value={form.type}
            onChange={(event) => setForm({ ...form, type: event.target.value })}
          >
            <option value="junmai">純米</option>
            <option value="ginjo">吟醸</option>
            <option value="daiginjo">大吟醸</option>
            <option value="nama">生</option>
            <option value="other">その他</option>
          </select>
        </label>
        <label>
          推奨温度(最小)
          <input
            value={form.min}
            onChange={(event) => setForm({ ...form, min: event.target.value })}
          />
        </label>
        <label>
          推奨温度(最大)
          <input
            value={form.max}
            onChange={(event) => setForm({ ...form, max: event.target.value })}
          />
        </label>
        <label>
          タイプ係数
          <input
            value={form.type_weight}
            onChange={(event) =>
              setForm({ ...form, type_weight: event.target.value })
            }
          />
        </label>
        <label>
          光感受性
          <select
            value={form.light_sensitive}
            onChange={(event) =>
              setForm({ ...form, light_sensitive: event.target.value })
            }
          >
            <option value="low">低</option>
            <option value="medium">中</option>
            <option value="high">高</option>
          </select>
        </label>
        <label>
          メモ
          <input
            value={form.notes}
            onChange={(event) => setForm({ ...form, notes: event.target.value })}
          />
        </label>
      </div>
      <button
        onClick={() => {
          if (!form.sku_id || !form.name_ja) return;
          onCreateSku({
            sku_id: form.sku_id,
            name_ja: form.name_ja,
            type: form.type as SKU["type"],
            recommended_temp_c: [
              Number.parseFloat(form.min),
              Number.parseFloat(form.max),
            ],
            type_weight: Number.parseFloat(form.type_weight),
            light_sensitive: form.light_sensitive as SKU["light_sensitive"],
            notes_ja: form.notes ? [form.notes] : [],
          });
          setForm({
            sku_id: "",
            name_ja: "",
            type: "junmai",
            min: "4",
            max: "8",
            type_weight: "2",
            light_sensitive: "medium",
            notes: "",
          });
        }}
      >
        新規登録
      </button>

      <div className="list">
        {skus.map((sku) => (
          <div key={sku.sku_id} className="list-item">
            <div>{sku.name_ja}</div>
            <div className="muted">
              {sku.recommended_temp_c[0]}〜{sku.recommended_temp_c[1]}℃ / {sku.type}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function BottleListPage({
  bottles,
  skus,
  onSelect,
}: {
  bottles: Bottle[];
  skus: SKU[];
  onSelect: (bottleId: string) => void;
}) {
  const [filter, setFilter] = useState<"open" | "empty" | "all">("open");
  const [query, setQuery] = useState("");

  const filtered = bottles.filter((bottle) => {
    const sku = skus.find((item) => item.sku_id === bottle.sku_id);
    const matchQuery = sku?.name_ja.includes(query) ?? false;
    if (filter === "open") return !bottle.emptied_at && matchQuery;
    if (filter === "empty") return Boolean(bottle.emptied_at) && matchQuery;
    return matchQuery;
  });

  return (
    <section className="card">
      <h2>ボトル一覧</h2>
      <div className="filters">
        <select
          value={filter}
          onChange={(event) => setFilter(event.target.value as typeof filter)}
        >
          <option value="open">開栓中</option>
          <option value="empty">空き</option>
          <option value="all">すべて</option>
        </select>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="銘柄検索"
        />
      </div>
      <div className="list">
        {filtered.map((bottle) => {
          const sku = skus.find((item) => item.sku_id === bottle.sku_id);
          return (
            <button
              key={bottle.bottle_id}
              className="list-item button-item"
              onClick={() => onSelect(bottle.bottle_id)}
            >
              <div>{sku?.name_ja ?? bottle.bottle_id}</div>
              <div className="muted">
                {bottle.opened_at ? "開栓中" : "未開栓"}
                {bottle.emptied_at ? " / 空き" : ""}
              </div>
            </button>
          );
        })}
        {filtered.length === 0 && <div className="muted">該当なし</div>}
      </div>
    </section>
  );
}

function BottleDetailPage({
  bottle,
  sku,
  tempLogs,
  result,
  comment,
  onOpen,
  onEmpty,
}: {
  bottle: Bottle;
  sku: SKU;
  tempLogs: TempLog[];
  result: QualityResult;
  comment: string;
  onOpen: () => void;
  onEmpty: () => void;
}) {
  const now = new Date();
  const start = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const recent = tempLogs.filter((log) => {
    const ts = new Date(log.ts);
    return ts >= start && ts <= now;
  });
  const temps = recent.map((log) => log.temp_c);
  const min = temps.length ? Math.min(...temps) : 0;
  const max = temps.length ? Math.max(...temps) : 0;
  const avg = temps.length
    ? temps.reduce((sum, value) => sum + value, 0) / temps.length
    : 0;

  return (
    <section className="card">
      <h2>ボトル詳細</h2>
      <div className="detail-grid">
        <div>
          <div className="label">銘柄名</div>
          <div>{sku.name_ja}</div>
        </div>
        <div>
          <div className="label">種別</div>
          <div>{sku.type}</div>
        </div>
        <div>
          <div className="label">推奨温度帯</div>
          <div>
            {sku.recommended_temp_c[0]}〜{sku.recommended_temp_c[1]}℃
          </div>
        </div>
        <div>
          <div className="label">開栓日</div>
          <div>{bottle.opened_at ?? "未開栓"}</div>
        </div>
        <div>
          <div className="label">経過日数</div>
          <div>{result.daysSinceOpen.toFixed(1)} 日</div>
        </div>
      </div>

      <div className="quality-section">
        <QualityBadge result={result} />
        <div className="quality-meta">
          <div>適正温度率: {(result.inRangeRatio * 100).toFixed(1)}%</div>
          <div>スパイク回数: {result.spikeCount}</div>
          <div>上限超過時間: {result.overMaxMinutes} 分</div>
        </div>
      </div>

      <div className="panel">
        <div className="label">直近24h</div>
        <div>
          最小 {min.toFixed(1)}℃ / 最大 {max.toFixed(1)}℃ / 平均 {avg.toFixed(1)}℃
        </div>
        <Sparkline values={temps} />
      </div>

      <div className="panel">
        <div className="label">コメント</div>
        <p>{comment}</p>
      </div>

      <div className="button-row">
        <button onClick={onOpen}>開栓</button>
        <button onClick={onEmpty}>空き</button>
      </div>
    </section>
  );
}

function TempImportPage({
  onImport,
}: {
  onImport: (preview: CsvPreview, timestampIndex: number, tempIndex: number) => void;
}) {
  const [preview, setPreview] = useState<CsvPreview | null>(null);
  const [timestampIndex, setTimestampIndex] = useState(0);
  const [tempIndex, setTempIndex] = useState(1);

  return (
    <section className="card">
      <h2>温度CSV取込</h2>
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          const text = await file.text();
          const parsed = parseCsv(text);
          setPreview(parsed);
          setTimestampIndex(0);
          setTempIndex(parsed.headers.length > 1 ? 1 : 0);
        }}
      />

      {preview && (
        <div className="panel">
          <div className="form-grid">
            <label>
              タイムスタンプ列
              <select
                value={timestampIndex}
                onChange={(event) => setTimestampIndex(Number(event.target.value))}
              >
                {preview.headers.map((header, index) => (
                  <option key={header} value={index}>
                    {header}
                  </option>
                ))}
              </select>
            </label>
            <label>
              温度列
              <select
                value={tempIndex}
                onChange={(event) => setTempIndex(Number(event.target.value))}
              >
                {preview.headers.map((header, index) => (
                  <option key={header} value={index}>
                    {header}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="table">
            <div className="table-row table-header">
              {preview.headers.map((header) => (
                <span key={header}>{header}</span>
              ))}
            </div>
            {preview.rows.slice(0, 10).map((row, rowIndex) => (
              <div className="table-row" key={`row-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <span key={`cell-${rowIndex}-${cellIndex}`}>{cell}</span>
                ))}
              </div>
            ))}
          </div>
          <button
            onClick={() => onImport(preview, timestampIndex, tempIndex)}
            disabled={preview.headers.length === 0}
          >
            取込開始
          </button>
        </div>
      )}
    </section>
  );
}
