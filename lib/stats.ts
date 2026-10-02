import { canonicalMood, isBaijiuMl, normalizeCount, normalizeMl } from "@/lib/quantity";
import type { DrinkType, Entry, Mood } from "@/lib/types";
import { DRINK_TYPES, MOODS } from "@/lib/types";
import { daysInMonth, startOfDay } from "@/lib/time";

export type DrinkCount = {
  type: DrinkType;
  count: number;
  ml: number;
  labels: { label: string; count: number }[];
};

export type Summary = {
  smokes: number;
  drinks: number;
  baijiuMl: number;
  byDrink: DrinkCount[];
  moods: Record<Mood, number>;
  unset: number;
};

function emptyMoods(): Record<Mood, number> {
  const moods = {} as Record<Mood, number>;
  for (const mood of MOODS) moods[mood] = 0;
  return moods;
}

export function emptySummary(): Summary {
  return {
    smokes: 0,
    drinks: 0,
    byDrink: DRINK_TYPES.map((type) => ({ type, count: 0, ml: 0, labels: [] })),
    baijiuMl: 0,
    moods: emptyMoods(),
    unset: 0,
  };
}

export function summarize(entries: Entry[]): Summary {
  const summary = emptySummary();
  const other = new Map<string, number>();
  for (const entry of entries) {
    const mood = canonicalMood(entry.mood);
    if (entry.kind === "drink" && isBaijiuMl(entry)) {
      const ml = normalizeMl(entry.count);
      summary.baijiuMl += ml;
      const bucket = summary.byDrink.find((item) => item.type === "白酒");
      if (bucket) bucket.ml += ml;
      if (mood) summary.moods[mood] += 1;
      else summary.unset += 1;
      continue;
    }
    const count = normalizeCount(entry.count);
    if (mood) summary.moods[mood] += count;
    else summary.unset += count;
    if (entry.kind === "smoke") {
      summary.smokes += count;
      continue;
    }
    summary.drinks += count;
    const bucket = summary.byDrink.find((item) => item.type === entry.drinkType);
    if (!bucket) continue;
    bucket.count += count;
    if (entry.drinkType === "其他") {
      const label = entry.drinkLabel.trim() || "其他";
      other.set(label, (other.get(label) ?? 0) + count);
    }
  }
  const otherBucket = summary.byDrink.find((item) => item.type === "其他");
  if (otherBucket) {
    otherBucket.labels = [...other.entries()].map(([label, count]) => ({ label, count }));
  }
  return summary;
}

export function filterToday(entries: Entry[], now = Date.now()) {
  const day = startOfDay(now);
  return entries.filter((entry) => startOfDay(entry.at) === day);
}

export function filterMonth(entries: Entry[], year: number, month: number) {
  return entries.filter((entry) => {
    const date = new Date(entry.at);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

export function filterYear(entries: Entry[], year: number) {
  return entries.filter((entry) => new Date(entry.at).getFullYear() === year);
}

export function listMonths(entries: Entry[]) {
  const keys = new Set<string>();
  for (const entry of entries) {
    const date = new Date(entry.at);
    keys.add(`${date.getFullYear()}-${date.getMonth() + 1}`);
  }
  return [...keys]
    .map((key) => {
      const [year, month] = key.split("-").map(Number);
      return { year, month, key: `${year}-${month}` };
    })
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

export function listYears(entries: Entry[]) {
  const years = new Set<number>();
  for (const entry of entries) years.add(new Date(entry.at).getFullYear());
  return [...years].sort((a, b) => b - a);
}

export type DayPoint = { day: number; smokes: number; drinks: number };

export function daySeries(entries: Entry[], year: number, month: number): DayPoint[] {
  const total = daysInMonth(year, month);
  const points: DayPoint[] = Array.from({ length: total }, (_, index) => ({
    day: index + 1,
    smokes: 0,
    drinks: 0,
  }));
  for (const entry of entries) {
    const date = new Date(entry.at);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month) continue;
    const point = points[date.getDate() - 1];
    if (!point) continue;
    if (entry.kind === "drink" && isBaijiuMl(entry)) continue;
    const count = normalizeCount(entry.count);
    if (entry.kind === "smoke") point.smokes += count;
    else point.drinks += count;
  }
  return points;
}

export type MonthPoint = { month: number; smokes: number; drinks: number };

export function monthSeries(entries: Entry[], year: number): MonthPoint[] {
  const points: MonthPoint[] = Array.from({ length: 12 }, (_, index) => ({
    month: index + 1,
    smokes: 0,
    drinks: 0,
  }));
  for (const entry of entries) {
    const date = new Date(entry.at);
    if (date.getFullYear() !== year) continue;
    const point = points[date.getMonth()];
    if (entry.kind === "drink" && isBaijiuMl(entry)) continue;
    const count = normalizeCount(entry.count);
    if (entry.kind === "smoke") point.smokes += count;
    else point.drinks += count;
  }
  return points;
}

export function moodParts(summary: Summary) {
  const parts = MOODS.filter((mood) => summary.moods[mood] > 0).map(
    (mood) => `${mood} ${summary.moods[mood]}`,
  );
  if (summary.unset > 0) parts.push(`未选 ${summary.unset}`);
  return parts;
}

export function drinkParts(summary: Summary) {
  return summary.byDrink.filter((item) => item.count > 0 || item.ml > 0);
}

export function formatDrinkPart(item: DrinkCount) {
  if (item.type === "其他" && item.labels.length > 0) {
    return item.labels.map((label) => `${label.label} ${label.count}`).join(" · ");
  }
  if (item.type === "白酒") {
    const bits: string[] = [];
    if (item.count > 0) bits.push(`白酒 ${item.count} 杯`);
    if (item.ml > 0) bits.push(`用量 ${item.ml} 毫升`);
    return bits.join(" · ");
  }
  return `${item.type} ${item.count}`;
}

export function drinkAmountText(entry: Extract<Entry, { kind: "drink" }>) {
  if (isBaijiuMl(entry)) return `用量 ${normalizeMl(entry.count)} 毫升`;
  if (entry.drinkType === "白酒") return `${normalizeCount(entry.count)} 杯`;
  return "";
}

export function shareText(title: string, summary: Summary) {
  const drinks = drinkParts(summary)
    .map((item) => formatDrinkPart(item))
    .join(" · ");
  const moods = moodParts(summary);
  const lines = [
    `烟酒生 · ${title}`,
    `烟 ${summary.smokes} 支`,
    `酒 ${summary.drinks} 杯`,
  ];
  if (summary.baijiuMl > 0) lines.push(`白酒用量 ${summary.baijiuMl} 毫升`);
  if (drinks) lines.push(drinks);
  lines.push(moods.length > 0 ? `心情 ${moods.join(" · ")}` : "心情还没选");
  lines.push("轻轻记下，不打分。");
  return lines.join("\n");
}

export function groupByDay(entries: Entry[]) {
  const sorted = [...entries].sort((a, b) => b.at - a.at);
  const groups: { day: number; entries: Entry[] }[] = [];
  for (const entry of sorted) {
    const day = startOfDay(entry.at);
    const last = groups[groups.length - 1];
    if (!last || last.day !== day) groups.push({ day, entries: [entry] });
    else last.entries.push(entry);
  }
  return groups;
}

export function drinkTitle(entry: Extract<Entry, { kind: "drink" }>) {
  if (entry.drinkType === "其他") return entry.drinkLabel.trim() || "其他";
  return entry.drinkType;
}
