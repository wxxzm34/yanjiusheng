export const MOODS = ["独酌明月", "会友欢饮", "闲坐静思", "乱我心忧"] as const;
export type Mood = (typeof MOODS)[number];

export const MOOD_COLORS: Record<Mood, string> = {
  独酌明月: "#6ea8d9",
  会友欢饮: "#f0a202",
  闲坐静思: "#6a9a6a",
  乱我心忧: "#c46b8a",
};

export const UNSET_MOOD_COLOR = "#e6d5c3";

export const DRINK_TYPES = ["红酒", "白酒", "啤酒", "家酿", "黄酒", "其他"] as const;
export type DrinkType = (typeof DRINK_TYPES)[number];

export type SmokeEntry = {
  id: string;
  kind: "smoke";
  at: number;
  mood: Mood | null;
  count: number;
};

export type DrinkEntry = {
  id: string;
  kind: "drink";
  at: number;
  mood: Mood | null;
  drinkType: DrinkType;
  drinkLabel: string;
  location: string;
  count: number;
};

export type Entry = SmokeEntry | DrinkEntry;

export type AppData = {
  version: 1;
  entries: Entry[];
  unlockedIds: string[];
  activeSkinId: string;
  activeBgId: string;
};

export type ShareFocus = "today" | "month" | "year";

export type ShareTarget = {
  focus: ShareFocus;
  year: number;
  month: number;
};
