const MAX_COUNT = 99;
const MOODS = ["独酌明月", "会友欢饮", "闲坐静思", "乱我心忧"];
const MOOD_COLORS = {
  独酌明月: "#6ea8d9",
  会友欢饮: "#f0a202",
  闲坐静思: "#6a9a6a",
  乱我心忧: "#c46b8a",
};
const UNSET_MOOD_COLOR = "#e6d5c3";
const LEGACY_MOODS = {
  开心: "会友欢饮",
  无聊: "独酌明月",
  难过: "乱我心忧",
};

function canonicalMood(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (MOODS.indexOf(text) >= 0) return text;
  return LEGACY_MOODS[text] || null;
}

function normalizeCount(value) {
  const parsed = readCount(value);
  if (parsed < 1) return 1;
  if (parsed > MAX_COUNT) return MAX_COUNT;
  return parsed;
}

function readCount(value) {
  if (typeof value === "number") {
    if (!Number.isFinite(value) || !Number.isInteger(value)) return 1;
    return value;
  }
  if (typeof value !== "string") return 1;
  const text = value.trim();
  if (!/^\d+$/.test(text)) return 1;
  return Number(text);
}

module.exports = {
  MAX_COUNT,
  MOODS,
  MOOD_COLORS,
  UNSET_MOOD_COLOR,
  LEGACY_MOODS,
  canonicalMood,
  normalizeCount,
};
