export const MOODS = ["平静", "开心", "难过"] as const;
export type Mood = (typeof MOODS)[number];

export const MOOD_EMOJI: Record<Mood, string> = {
  平静: "😌",
  开心: "😄",
  难过: "😢",
};

export const MOOD_COLORS: Record<Mood, string> = {
  平静: "#5b8fa8",
  开心: "#f0a202",
  难过: "#c46b8a",
};

export const UNSET_MOOD_COLOR = "#e6d5c3";

export const DRINK_TYPES = ["红酒", "白酒", "啤酒", "家酿", "黄酒", "其他"] as const;
export type DrinkType = (typeof DRINK_TYPES)[number];

export type SmokeEntry = {
  id: string;
  kind: "smoke";
  at: number;
  mood: Mood | null;
  /** 心情感悟，没有就不写。 */
  note?: string;
  count: number;
};

export type DrinkEntry = {
  id: string;
  kind: "drink";
  at: number;
  mood: Mood | null;
  /** 心情感悟，没有就不写。 */
  note?: string;
  drinkType: DrinkType;
  drinkLabel: string;
  location: string;
  count: number;
  /** 白酒：ml 表示毫升。没有这个字段，或是 cup，表示原来按杯记下的数量。 */
  unit?: "ml" | "cup";
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
