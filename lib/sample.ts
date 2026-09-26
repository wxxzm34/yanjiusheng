import { createId } from "@/lib/storage";
import type { DrinkEntry, DrinkType, Entry, Mood, SmokeEntry } from "@/lib/types";

function at(dayOffset: number, hour: number, minute: number, now: number) {
  const date = new Date(now);
  date.setDate(date.getDate() - dayOffset);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() > now) date.setTime(now - (hour + 1) * 60_000);
  return date.getTime();
}

function smoke(dayOffset: number, hour: number, minute: number, mood: Mood | null, now: number): SmokeEntry {
  return { id: createId(), kind: "smoke", at: at(dayOffset, hour, minute, now), mood, count: 1 };
}

function drink(
  dayOffset: number,
  hour: number,
  minute: number,
  mood: Mood | null,
  drinkType: DrinkType,
  location: string,
  now: number,
  drinkLabel?: string,
): DrinkEntry {
  return {
    id: createId(),
    kind: "drink",
    at: at(dayOffset, hour, minute, now),
    mood,
    drinkType,
    drinkLabel: drinkType === "其他" ? drinkLabel || "其他" : drinkType,
    location,
    count: 1,
  };
}

export function buildSample(now = Date.now()): Entry[] {
  return [
    smoke(0, 9, 12, "独酌明月", now),
    smoke(0, 15, 40, "会友欢饮", now),
    drink(0, 19, 5, "会友欢饮", "啤酒", "阳台", now),
    smoke(1, 21, 18, "乱我心忧", now),
    drink(1, 20, 2, "会友欢饮", "红酒", "厨房", now),
    smoke(2, 11, 6, "闲坐静思", now),
    smoke(2, 16, 44, null, now),
    drink(3, 18, 30, "会友欢饮", "白酒", "街角", now),
    smoke(5, 13, 10, "会友欢饮", now),
    drink(6, 17, 22, "独酌明月", "黄酒", "家里", now),
    drink(8, 19, 48, "会友欢饮", "家酿", "朋友家", now),
    drink(9, 21, 5, "会友欢饮", "其他", "露台", now, "桂花酿"),
    smoke(12, 10, 8, "乱我心忧", now),
    smoke(12, 22, 16, "独酌明月", now),
    smoke(18, 14, 2, "会友欢饮", now),
    drink(20, 19, 40, "会友欢饮", "啤酒", "公司楼下", now),
    smoke(35, 20, 12, "独酌明月", now),
    smoke(36, 12, 30, "会友欢饮", now),
    drink(38, 18, 18, "乱我心忧", "红酒", "小馆", now),
    smoke(100, 21, 8, "会友欢饮", now),
    drink(102, 19, 16, "独酌明月", "啤酒", "球场边", now),
  ];
}
