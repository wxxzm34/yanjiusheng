import type { Mood } from "@/lib/types";
import { MOODS } from "@/lib/types";

export const MAX_COUNT = 99;
export const MAX_ML = 999;
export const DEFAULT_BAIJIU_ML = 50;

const moodSet = new Set<string>(MOODS);

export const LEGACY_MOODS: Record<string, Mood> = {
  无聊: "平静",
  独酌明月: "平静",
  闲坐静思: "平静",
  会友欢饮: "开心",
  乱我心忧: "难过",
};

export function canonicalMood(value: unknown): Mood | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (moodSet.has(text)) return text as Mood;
  return LEGACY_MOODS[text] ?? null;
}

export function clampQty(value: unknown, min: number, max: number): number {
  const parsed = parseDigits(value);
  if (parsed == null || parsed < min) return min;
  if (parsed > max) return max;
  return parsed;
}

export function normalizeAmount(value: unknown, max: number): number {
  return clampQty(value, 1, max);
}

export function normalizeCount(value: unknown): number {
  return normalizeAmount(value, MAX_COUNT);
}

export function normalizeMl(value: unknown): number {
  return normalizeAmount(value, MAX_ML);
}

export function isBaijiuMl(entry: { kind?: string; drinkType?: string; unit?: string }): boolean {
  return entry.kind !== "smoke" && entry.drinkType === "白酒" && entry.unit === "ml";
}

function parseDigits(value: unknown): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return null;
    return value;
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!/^\d+$/.test(text)) return null;
  return Number(text);
}
