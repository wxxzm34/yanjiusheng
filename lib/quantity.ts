import type { Mood } from "@/lib/types";
import { MOODS } from "@/lib/types";

export const MAX_COUNT = 99;

const moodSet = new Set<string>(MOODS);

export const LEGACY_MOODS: Record<string, Mood> = {
  开心: "会友欢饮",
  无聊: "独酌明月",
  难过: "乱我心忧",
};

export function canonicalMood(value: unknown): Mood | null {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (moodSet.has(text)) return text as Mood;
  return LEGACY_MOODS[text] ?? null;
}

export function normalizeCount(value: unknown): number {
  const parsed = readCount(value);
  if (parsed < 1) return 1;
  if (parsed > MAX_COUNT) return MAX_COUNT;
  return parsed;
}

function readCount(value: unknown): number {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return 1;
    return value;
  }
  if (typeof value !== "string") return 1;
  const text = value.trim();
  if (!/^\d+$/.test(text)) return 1;
  return Number(text);
}
