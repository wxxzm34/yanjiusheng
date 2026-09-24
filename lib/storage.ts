import {
  BACKGROUNDS,
  DEFAULT_BG_ID,
  DEFAULT_SKIN_ID,
  SKINS,
  getBackground,
  getSkin,
} from "@/lib/packs";
import type { AppData, DrinkEntry, DrinkType, Entry, Mood, SmokeEntry } from "@/lib/types";
import { DRINK_TYPES, MOODS } from "@/lib/types";

export const STORAGE_KEY = "yanjiusheng.v1";

const moodSet = new Set<string>(MOODS);
const drinkSet = new Set<string>(DRINK_TYPES);
const skinIds = new Set(SKINS.map((skin) => skin.id));
const backgroundIds = new Set(BACKGROUNDS.map((background) => background.id));

export function defaultData(): AppData {
  return {
    version: 1,
    entries: [],
    unlockedIds: SKINS.filter((skin) => skin.free)
      .map((skin) => skin.id)
      .concat(BACKGROUNDS.filter((background) => background.free).map((background) => background.id)),
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

function asMood(value: unknown): Mood | null {
  return typeof value === "string" && moodSet.has(value) ? (value as Mood) : null;
}

function sanitizeEntry(value: unknown): Entry | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Record<string, unknown>;
  if (typeof item.id !== "string" || !item.id) return null;
  if (typeof item.at !== "number" || !Number.isFinite(item.at)) return null;
  const mood = asMood(item.mood);
  if (item.kind === "smoke") {
    const entry: SmokeEntry = { id: item.id, kind: "smoke", at: item.at, mood };
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
  const entry: DrinkEntry = {
    id: item.id,
    kind: "drink",
    at: item.at,
    mood,
    drinkType,
    drinkLabel,
    location,
  };
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
      if (typeof id === "string" && (skinIds.has(id) || backgroundIds.has(id))) unlocked.add(id);
    }
  }
  const unlockedIds = [...unlocked];
  let activeSkinId = typeof raw.activeSkinId === "string" ? raw.activeSkinId : base.activeSkinId;
  let activeBgId = typeof raw.activeBgId === "string" ? raw.activeBgId : base.activeBgId;
  if (!getSkin(activeSkinId) || !unlocked.has(activeSkinId)) activeSkinId = DEFAULT_SKIN_ID;
  if (!getBackground(activeBgId) || !unlocked.has(activeBgId)) activeBgId = DEFAULT_BG_ID;
  return { version: 1, entries, unlockedIds, activeSkinId, activeBgId };
}

export function loadData(): AppData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return defaultData();
  return sanitizeData(JSON.parse(raw));
}

export function persistData(data: AppData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}
