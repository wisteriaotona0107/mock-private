import type { TempLog } from "../models/temp_log.schema";
import { fridgeId } from "./db";

export interface CsvPreview {
  headers: string[];
  rows: string[][];
}

const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
};

export const parseCsv = (text: string): CsvPreview => {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length === 0) {
    return { headers: [], rows: [] };
  }
  const headers = parseCsvLine(lines[0]);
  const rows = lines.slice(1).map(parseCsvLine);
  return { headers, rows };
};

const normalizeTimestamp = (value: string): string => {
  const trimmed = value.trim();
  const parsed = new Date(trimmed);
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.toISOString();
  }
  const normalized = trimmed.replace(/\//g, "-");
  const withZone = normalized.includes("+") || normalized.includes("Z")
    ? normalized
    : `${normalized}+09:00`;
  const fallback = new Date(withZone);
  return Number.isNaN(fallback.getTime()) ? new Date().toISOString() : fallback.toISOString();
};

export const buildTempLogs = (
  preview: CsvPreview,
  timestampIndex: number,
  tempIndex: number
): TempLog[] => {
  return preview.rows
    .map((row) => {
      const tsValue = row[timestampIndex] ?? "";
      const tempValue = row[tempIndex] ?? "";
      const temp = Number.parseFloat(tempValue);
      if (!tsValue || Number.isNaN(temp)) return null;
      return {
        ts: normalizeTimestamp(tsValue),
        fridge_id: fridgeId,
        temp_c: temp,
      } as TempLog;
    })
    .filter((log): log is TempLog => Boolean(log));
};
