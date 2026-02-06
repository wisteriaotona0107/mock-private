import { openDB, type DBSchema } from "idb";
import type { SKU } from "../models/sku.schema";
import type { Bottle } from "../models/bottle.schema";
import type { TempLog } from "../models/temp_log.schema";
import type { EventLog } from "../models/event.schema";

interface SakeDB extends DBSchema {
  skus: {
    key: string;
    value: SKU;
    indexes: { "by-name": string };
  };
  bottles: {
    key: string;
    value: Bottle;
    indexes: { "by-sku": string; "by-opened": string };
  };
  tempLogs: {
    key: string;
    value: TempLog;
    indexes: { "by-fridge": string };
  };
  events: {
    key: string;
    value: EventLog;
  };
  meta: {
    key: string;
    value: { key: string; value: string };
  };
}

const DB_NAME = "sake-quality-db";
const DB_VERSION = 1;

const seedSkus: Omit<SKU, "created_at" | "updated_at">[] = [
  {
    sku_id: "SKU-JIKON-JUNMAI",
    name_ja: "而今 純米",
    type: "junmai",
    recommended_temp_c: [4, 8],
    type_weight: 2,
    light_sensitive: "medium",
    notes_ja: ["まろやかな旨味"],
  },
  {
    sku_id: "SKU-JUYONDAI-GINJO",
    name_ja: "十四代 吟醸",
    type: "ginjo",
    recommended_temp_c: [4, 8],
    type_weight: 3,
    light_sensitive: "high",
    notes_ja: ["華やかな香り"],
  },
  {
    sku_id: "SKU-ARAMASA-6",
    name_ja: "新政 No.6",
    type: "nama",
    recommended_temp_c: [4, 6],
    type_weight: 6,
    light_sensitive: "high",
    notes_ja: ["フレッシュ"],
  },
  {
    sku_id: "SKU-KOKURYU-DAIGINJO",
    name_ja: "黒龍 大吟醸",
    type: "daiginjo",
    recommended_temp_c: [5, 10],
    type_weight: 4,
    light_sensitive: "medium",
    notes_ja: ["すっきり"],
  },
];

const nowIso = () => new Date().toISOString();

export const dbPromise = openDB<SakeDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const skuStore = db.createObjectStore("skus", { keyPath: "sku_id" });
    skuStore.createIndex("by-name", "name_ja");

    const bottleStore = db.createObjectStore("bottles", { keyPath: "bottle_id" });
    bottleStore.createIndex("by-sku", "sku_id");
    bottleStore.createIndex("by-opened", "opened_at");

    const tempStore = db.createObjectStore("tempLogs", { keyPath: "ts" });
    tempStore.createIndex("by-fridge", "fridge_id");

    db.createObjectStore("events", { keyPath: "event_id" });

    db.createObjectStore("meta", { keyPath: "key" });
  },
});

export async function seedDefaultSkus() {
  const db = await dbPromise;
  const count = await db.count("skus");
  if (count > 0) return;
  const tx = db.transaction("skus", "readwrite");
  seedSkus.forEach((sku) => {
    const timestamp = nowIso();
    tx.store.put({
      ...sku,
      created_at: timestamp,
      updated_at: timestamp,
    });
  });
  await tx.done;
}

export async function getSkus() {
  const db = await dbPromise;
  return db.getAll("skus");
}

export async function upsertSku(sku: SKU) {
  const db = await dbPromise;
  await db.put("skus", sku);
}

export async function deleteSku(skuId: string) {
  const db = await dbPromise;
  await db.delete("skus", skuId);
}

export async function getBottles() {
  const db = await dbPromise;
  return db.getAll("bottles");
}

export async function getBottle(bottleId: string) {
  const db = await dbPromise;
  return db.get("bottles", bottleId);
}

export async function upsertBottle(bottle: Bottle) {
  const db = await dbPromise;
  await db.put("bottles", bottle);
}

export async function addEvent(event: EventLog) {
  const db = await dbPromise;
  await db.put("events", event);
}

export async function addTempLogs(logs: TempLog[]) {
  if (logs.length === 0) return;
  const db = await dbPromise;
  const tx = db.transaction("tempLogs", "readwrite");
  logs.forEach((log) => tx.store.put(log));
  await tx.done;
}

export async function getTempLogs(fridgeId: "FR-01") {
  const db = await dbPromise;
  return db.getAllFromIndex("tempLogs", "by-fridge", fridgeId);
}

export async function getMeta(key: string) {
  const db = await dbPromise;
  const item = await db.get("meta", key);
  return item?.value ?? null;
}

export async function setMeta(key: string, value: string) {
  const db = await dbPromise;
  await db.put("meta", { key, value });
}

export const fridgeId: "FR-01" = "FR-01";
