import { DEFAULT_BG_ID, DEFAULT_SKIN_ID, OUTFITS, getBackground, getSkin } from "@/lib/packs";
import { canonicalMood, normalizeCount, normalizeMl } from "@/lib/quantity";
import type { AppData, DrinkEntry, DrinkType, Entry, SmokeEntry } from "@/lib/types";
import { DRINK_TYPES } from "@/lib/types";

export const STORAGE_KEY = "yanjiusheng.v1";

const drinkSet = new Set<string>(DRINK_TYPES);
const outfitIds = new Set(OUTFITS.map((outfit) => outfit.id));

export function defaultData(): AppData {
  return {
    version: 1,
    entries: [],
    unlockedIds: OUTFITS.filter((outfit) => outfit.free).map((outfit) => outfit.id),
    activeSkinId: DEFAULT_SKIN_ID,
    activeBgId: DEFAULT_BG_ID,
  };
}

export function createId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitizeEntry(value: unknown): Entry | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || !item.id) return null;
  if (typeof item.at !== "number" || !Number.isFinite(item.at)) return null;
  const mood = canonicalMood(item.mood);
  if (item.kind === "smoke") {
    const count = normalizeCount(item.count);
    const entry: SmokeEntry = { id: item.id, kind: "smoke", at: item.at, mood, count };
    return entry;
  }
  if (item.kind !== "drink") return null;
  if (typeof item.drinkType !== "string" || !drinkSet.has(item.drinkType)) return null;
  const drinkType = item.drinkType as DrinkType;
  const drinkLabel =
    typeof item.drinkLabel === "string" && item.drinkLabel.trim()
      ? item.drinkLabel.trim().slice(0, 12)
      : drinkType;
  const location = typeof item.location === "string" ? item.location.trim().slice(0, 24) : "";
  const volume = drinkType === "白酒" && item.unit === "ml";
  const entry: DrinkEntry = {
    id: item.id,
    kind: "drink",
    at: item.at,
    mood,
    drinkType,
    drinkLabel,
    location,
    count: volume ? normalizeMl(item.count) : normalizeCount(item.count),
  };
  if (drinkType === "白酒") entry.unit = volume ? "ml" : "cup";
  return entry;
}

export function sanitizeData(value: unknown): AppData {
  const base = defaultData();
  if (!value || typeof value !== "object") return base;
  const raw = value as Record<string, unknown>;
  const entries = Array.isArray(raw.entries)
    ? raw.entries.map(sanitizeEntry).filter((entry): entry is Entry => entry !== null)
    : [];
  const unlocked = new Set(base.unlockedIds);
  if (Array.isArray(raw.unlockedIds)) {
    for (const id of raw.unlockedIds) {
      if (typeof id === "string" && outfitIds.has(id)) unlocked.add(id);
    }
  }
  const unlockedIds = [...unlocked];
  let activeSkinId = typeof raw.activeSkinId === "string" ? raw.activeSkinId : base.activeSkinId;
  let activeBgId = typeof raw.activeBgId === "string" ? raw.activeBgId : base.activeBgId;
  if (!getSkin(activeSkinId) || !unlocked.has(activeSkinId)) activeSkinId = DEFAULT_SKIN_ID;
  if (!getBackground(activeBgId) || !unlocked.has(activeBgId)) activeBgId = DEFAULT_BG_ID;
  const outfitId = getSkin(activeSkinId) ? activeSkinId : DEFAULT_SKIN_ID;
  return { version: 1, entries, unlockedIds, activeSkinId: outfitId, activeBgId: outfitId };
}

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();
  return sanitizeData(JSON.parse(raw));
}

export function persistData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
