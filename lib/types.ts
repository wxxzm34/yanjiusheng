export const MOODS = ["无聊", "开心", "难过"] as const;
export type Mood = (typeof MOODS)[number];

export const DRINK_TYPES = ["红酒", "白酒", "啤酒", "家酿", "黄酒", "其他"] as const;
export type DrinkType = (typeof DRINK_TYPES)[number];

export type SmokeEntry = {
  id: string;
  kind: "smoke";
  at: number;
  mood: Mood | null;
};

export type DrinkEntry = {
  id: string;
  kind: "drink";
  at: number;
  mood: Mood | null;
  drinkType: DrinkType;
  drinkLabel: string;
  location: string;
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
