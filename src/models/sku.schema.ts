export interface SKU {
  sku_id: string;
  name_ja: string;
  type: "junmai" | "ginjo" | "daiginjo" | "nama" | "other";
  recommended_temp_c: [number, number];
  type_weight: number;
  light_sensitive: "low" | "medium" | "high";
  notes_ja: string[];
  created_at: string;
  updated_at: string;
}
