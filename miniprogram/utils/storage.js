const { OUTFITS, DEFAULT_OUTFIT_ID } = require("./packs");
const { MOODS, canonicalMood, normalizeCount, normalizeMl } = require("./quantity");

const KEY = "yanjiusheng.v1";
const DRINKS = ["红酒", "白酒", "啤酒", "家酿", "黄酒", "其他"];

function defaultData() {
  return {
    version: 1,
    entries: [],
    unlockedIds: [DEFAULT_OUTFIT_ID],
    activeSkinId: DEFAULT_OUTFIT_ID,
    activeBgId: DEFAULT_OUTFIT_ID,
  };
}

function uid() {
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function sanitize(raw) {
  const base = defaultData();
  if (!raw || typeof raw !== "object") return base;
  const skinIds = new Set(OUTFITS.map((item) => item.id));
  const bgIds = skinIds;
  const unlocked = new Set(base.unlockedIds);
  (raw.unlockedIds || []).forEach((id) => {
    if (skinIds.has(id) || bgIds.has(id)) unlocked.add(id);
  });
  const entries = [];
  (raw.entries || []).forEach((item) => {
    if (!item || typeof item.id !== "string" || typeof item.at !== "number") return;
    const mood = canonicalMood(item.mood);
    if (item.kind === "smoke") {
      entries.push({ id: item.id, kind: "smoke", at: item.at, mood, count: normalizeCount(item.count) });
      return;
    }
    if (item.kind !== "drink" || DRINKS.indexOf(item.drinkType) < 0) return;
    const volume = item.drinkType === "白酒" && item.unit === "ml";
    const drink = {
      id: item.id,
      kind: "drink",
      at: item.at,
      mood,
      drinkType: item.drinkType,
      drinkLabel: String(item.drinkLabel || item.drinkType).slice(0, 12),
      location: String(item.location || "").slice(0, 24),
      count: volume ? normalizeMl(item.count) : normalizeCount(item.count),
    };
    if (item.drinkType === "白酒") drink.unit = volume ? "ml" : "cup";
    entries.push(drink);
  });
  let activeSkinId = skinIds.has(raw.activeSkinId) ? raw.activeSkinId : base.activeSkinId;
  let activeBgId = bgIds.has(raw.activeBgId) ? raw.activeBgId : base.activeBgId;
  if (!unlocked.has(activeSkinId)) activeSkinId = DEFAULT_OUTFIT_ID;
  if (!unlocked.has(activeBgId)) activeBgId = DEFAULT_OUTFIT_ID;
  const outfitId = skinIds.has(activeSkinId) ? activeSkinId : DEFAULT_OUTFIT_ID;
  return {
    version: 1,
    entries,
    unlockedIds: Array.from(unlocked),
    activeSkinId: outfitId,
    activeBgId: outfitId,
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
  // 保存后上传烟和酒的时间，供微信汇总。失败也不影响手机里的记录。
  try {
    require("./sync").scheduleEntrySync();
  } catch (error) {
    // 上传模块没装上时，记录仍然留在手机里。
  }
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
    smoke(0, 9, 12, "平静"),
    smoke(0, 15, 40, "开心"),
    drink(0, 19, 5, "开心", "啤酒", "阳台"),
    smoke(1, 21, 18, "难过"),
    drink(1, 20, 2, "平静", "红酒", "厨房"),
    smoke(35, 20, 12, "平静"),
    drink(38, 18, 18, "难过", "黄酒", "家里"),
    drink(100, 19, 16, "开心", "其他", "露台", "桂花酿"),
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
