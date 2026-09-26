const { SKINS, BACKGROUNDS } = require("./packs");
const { MOODS, canonicalMood, normalizeCount } = require("./quantity");

const KEY = "yanjiusheng.v1";
const DRINKS = ["红酒", "白酒", "啤酒", "家酿", "黄酒", "其他"];

function defaultData() {
  return {
    version: 1,
    entries: [],
    unlockedIds: ["skin-star", "bg-lamp", "bg-balcony"],
    activeSkinId: "skin-star",
    activeBgId: "bg-lamp",
  };
}

function uid() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitize(raw) {
  const base = defaultData();
  if (!raw || typeof raw !== "object") return base;
  const skinIds = new Set(SKINS.map((item) => item.id));
  const bgIds = new Set(BACKGROUNDS.map((item) => item.id));
  const unlocked = new Set(base.unlockedIds);
  (raw.unlockedIds || []).forEach((id) => {
    if (skinIds.has(id) || bgIds.has(id)) unlocked.add(id);
  });
  const entries = [];
  (raw.entries || []).forEach((item) => {
    if (!item || typeof item.id !== "string" || typeof item.at !== "number") return;
    const mood = canonicalMood(item.mood);
    const count = normalizeCount(item.count);
    if (item.kind === "smoke") {
      entries.push({ id: item.id, kind: "smoke", at: item.at, mood, count });
      return;
    }
    if (item.kind !== "drink" || DRINKS.indexOf(item.drinkType) < 0) return;
    entries.push({
      id: item.id,
      kind: "drink",
      at: item.at,
      mood,
      drinkType: item.drinkType,
      drinkLabel: String(item.drinkLabel || item.drinkType).slice(0, 12),
      location: String(item.location || "").slice(0, 24),
      count,
    });
  });
  let activeSkinId = skinIds.has(raw.activeSkinId) ? raw.activeSkinId : base.activeSkinId;
  let activeBgId = bgIds.has(raw.activeBgId) ? raw.activeBgId : base.activeBgId;
  if (!unlocked.has(activeSkinId)) activeSkinId = "skin-star";
  if (!unlocked.has(activeBgId)) activeBgId = "bg-lamp";
  return {
    version: 1,
    entries,
    unlockedIds: Array.from(unlocked),
    activeSkinId,
    activeBgId,
  };
}

function load() {
  try {
    const raw = wx.getStorageSync(KEY);
    if (!raw) return defaultData();
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    return sanitize(data);
  } catch (error) {
    return defaultData();
  }
}

function save(data) {
  wx.setStorageSync(KEY, data);
}

function stamp(dayOffset, hour, minute, now) {
  const date = new Date(now);
  date.setDate(date.getDate() - dayOffset);
  date.setHours(hour, minute, 0, 0);
  if (date.getTime() > now) date.setTime(now - (hour + 1) * 60000);
  return date.getTime();
}

function buildSample(now) {
  const base = now || Date.now();
  const smoke = (day, hour, minute, mood) => ({
    id: uid(),
    kind: "smoke",
    at: stamp(day, hour, minute, base),
    mood,
    count: 1,
  });
  const drink = (day, hour, minute, mood, drinkType, location, label) => ({
    id: uid(),
    kind: "drink",
    at: stamp(day, hour, minute, base),
    mood,
    drinkType,
    drinkLabel: drinkType === "其他" ? label || "其他" : drinkType,
    location,
    count: 1,
  });
  return [
    smoke(0, 9, 12, "独酌明月"),
    smoke(0, 15, 40, "会友欢饮"),
    drink(0, 19, 5, "会友欢饮", "啤酒", "阳台"),
    smoke(1, 21, 18, "乱我心忧"),
    drink(1, 20, 2, "闲坐静思", "红酒", "厨房"),
    smoke(35, 20, 12, "独酌明月"),
    drink(38, 18, 18, "乱我心忧", "黄酒", "家里"),
    drink(100, 19, 16, "会友欢饮", "其他", "露台", "桂花酿"),
  ];
}

module.exports = {
  KEY,
  MOODS,
  DRINKS,
  defaultData,
  uid,
  load,
  save,
  buildSample,
  sanitize,
  canonicalMood,
  normalizeCount,
};
