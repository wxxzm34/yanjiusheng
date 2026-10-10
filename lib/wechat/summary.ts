import { normalizeCount, normalizeMl } from "@/lib/quantity";
import { summarize } from "@/lib/stats";
import { DRINK_TYPES, type DrinkType, type Entry } from "@/lib/types";

export type Period = "daily" | "monthly" | "yearly";

export type Prefs = {
  daily: boolean;
  monthly: boolean;
  yearly: boolean;
  hour: number;
  minute: number;
  monthDay: number;
  yearMonth: number;
  yearDay: number;
};

export type CountEntry = {
  kind: "smoke" | "drink";
  at: number;
  count: number;
  drinkType?: DrinkType;
  unit?: "ml" | "cup";
};

export type Counts = {
  smokes: number;
  drinks: number;
  baijiuMl: number;
};

export type ShanghaiParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
};

export const PERIOD_LABEL: Record<Period, string> = {
  daily: "一天小结",
  monthly: "本月汇总",
  yearly: "今年汇总",
};

export const SEND_WINDOW_MINUTES = 10;

export function defaultPrefs(): Prefs {
  return {
    daily: false,
    monthly: false,
    yearly: false,
    hour: 21,
    minute: 0,
    monthDay: 31,
    yearMonth: 12,
    yearDay: 31,
  };
}

export function daysInMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

export function clampDay(year: number, month: number, day: number) {
  return Math.min(Math.max(day, 1), daysInMonth(year, month));
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function shanghaiParts(date: Date): ShanghaiParts | null {
  if (Number.isNaN(date.getTime())) return null;
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const bag: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") bag[part.type] = part.value;
  }
  let hour = Number(bag.hour);
  if (hour === 24) hour = 0;
  const parts = {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour,
    minute: Number(bag.minute),
  };
  if (Object.values(parts).some((value) => !Number.isInteger(value))) return null;
  return parts;
}

export function periodStamp(period: Period, now: ShanghaiParts) {
  if (period === "daily") return `${now.year}-${pad(now.month)}-${pad(now.day)}`;
  if (period === "monthly") return `${now.year}-${pad(now.month)}`;
  return String(now.year);
}

function inSendWindow(prefs: Prefs, now: ShanghaiParts) {
  const delta = now.hour * 60 + now.minute - (prefs.hour * 60 + prefs.minute);
  return delta >= 0 && delta < SEND_WINDOW_MINUTES;
}

export function isDue(prefs: Prefs, period: Period, now: ShanghaiParts) {
  if (!prefs[period]) return false;
  if (!inSendWindow(prefs, now)) return false;
  if (period === "monthly" && now.day !== clampDay(now.year, now.month, prefs.monthDay)) return false;
  if (period === "yearly") {
    if (now.month !== prefs.yearMonth) return false;
    if (now.day !== clampDay(now.year, prefs.yearMonth, prefs.yearDay)) return false;
  }
  return true;
}

export function duePeriods(prefs: Prefs, now: ShanghaiParts): Period[] {
  return (["daily", "monthly", "yearly"] as const).filter((period) => isDue(prefs, period, now));
}

const drinkTypes: readonly string[] = DRINK_TYPES;

function isDrinkType(value: unknown): value is DrinkType {
  return typeof value === "string" && drinkTypes.includes(value);
}

function toEntry(entry: CountEntry): Entry {
  if (entry.kind === "smoke") {
    return {
      id: "s",
      kind: "smoke",
      at: entry.at,
      mood: null,
      count: normalizeCount(entry.count),
    };
  }
  const drinkType = entry.drinkType && isDrinkType(entry.drinkType) ? entry.drinkType : "其他";
  const volume = drinkType === "白酒" && entry.unit === "ml";
  return {
    id: "d",
    kind: "drink",
    at: entry.at,
    mood: null,
    drinkType,
    drinkLabel: drinkType,
    location: "",
    count: volume ? normalizeMl(entry.count) : normalizeCount(entry.count),
    unit: drinkType === "白酒" ? (volume ? "ml" : "cup") : undefined,
  };
}

function pack(entries: Entry[]): Counts {
  const summary = summarize(entries);
  return { smokes: summary.smokes, drinks: summary.drinks, baijiuMl: summary.baijiuMl };
}

export function countsFor(entries: CountEntry[], now: ShanghaiParts): Record<Period, Counts> {
  const yearly: Entry[] = [];
  const monthly: Entry[] = [];
  const daily: Entry[] = [];
  for (const raw of entries) {
    const entry = toEntry(raw);
    const parts = shanghaiParts(new Date(entry.at));
    if (!parts || parts.year !== now.year) continue;
    yearly.push(entry);
    if (parts.month !== now.month) continue;
    monthly.push(entry);
    if (parts.day !== now.day) continue;
    daily.push(entry);
  }
  return { daily: pack(daily), monthly: pack(monthly), yearly: pack(yearly) };
}

function bool(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function integer(value: unknown, min: number, max: number, fallback: number) {
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) return fallback;
  return value;
}

export function sanitizePrefs(value: unknown, base = defaultPrefs()): Prefs {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return {
    daily: bool(raw.daily, base.daily),
    monthly: bool(raw.monthly, base.monthly),
    yearly: bool(raw.yearly, base.yearly),
    hour: integer(raw.hour, 0, 23, base.hour),
    minute: integer(raw.minute, 0, 59, base.minute),
    monthDay: integer(raw.monthDay, 1, 31, base.monthDay),
    yearMonth: integer(raw.yearMonth, 1, 12, base.yearMonth),
    yearDay: integer(raw.yearDay, 1, 31, base.yearDay),
  };
}

const MIN_AT = Date.UTC(2000, 0, 1);
const MAX_AT = Date.UTC(2100, 0, 1);

export function sanitizeEntries(value: unknown): CountEntry[] {
  if (!Array.isArray(value)) return [];
  const entries: CountEntry[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const raw = item as Record<string, unknown>;
    if (raw.kind !== "smoke" && raw.kind !== "drink") continue;
    if (typeof raw.at !== "number" || !Number.isFinite(raw.at) || raw.at < MIN_AT || raw.at > MAX_AT) continue;
    const given = typeof raw.count === "number" && Number.isFinite(raw.count) ? raw.count : 1;
    if (raw.kind === "smoke") {
      entries.push({ kind: "smoke", at: raw.at, count: normalizeCount(given) });
      continue;
    }
    const drinkType = isDrinkType(raw.drinkType) ? raw.drinkType : "其他";
    const unit = raw.unit === "ml" || raw.unit === "cup" ? raw.unit : undefined;
    const volume = drinkType === "白酒" && unit === "ml";
    const entry: CountEntry = {
      kind: "drink",
      at: raw.at,
      count: volume ? normalizeMl(given) : normalizeCount(given),
      drinkType,
    };
    if (drinkType === "白酒") entry.unit = volume ? "ml" : "cup";
    entries.push(entry);
  }
  entries.sort((a, b) => b.at - a.at);
  return entries.slice(0, 20_000);
}
