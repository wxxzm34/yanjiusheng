const MAX_COUNT = 99;
const MAX_ML = 999;
const DEFAULT_BAIJIU_ML = 50;
const MOODS = ["平静", "开心", "难过"];
const MOOD_EMOJI = {
  平静: "😌",
  开心: "😄",
  难过: "😢",
};
const MOOD_COLORS = {
  平静: "#5b8fa8",
  开心: "#f0a202",
  难过: "#c46b8a",
};
const UNSET_MOOD_COLOR = "#e6d5c3";
const LEGACY_MOODS = {
  无聊: "平静",
  独酌明月: "平静",
  闲坐静思: "平静",
  会友欢饮: "开心",
  乱我心忧: "难过",
};

function canonicalMood(value) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!text) return null;
  if (MOODS.indexOf(text) >= 0) return text;
  return LEGACY_MOODS[text] || null;
}

function normalizeAmount(value, max) {
  const parsed = readCount(value);
  if (parsed < 1) return 1;
  if (parsed > max) return max;
  return parsed;
}

function normalizeCount(value) {
  return normalizeAmount(value, MAX_COUNT);
}

function normalizeMl(value) {
  return normalizeAmount(value, MAX_ML);
}

function isBaijiuMl(entry) {
  return Boolean(entry && entry.kind !== "smoke" && entry.drinkType === "白酒" && entry.unit === "ml");
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
  MAX_ML,
  DEFAULT_BAIJIU_ML,
  normalizeAmount,
  normalizeMl,
  isBaijiuMl,
  MOODS,
  MOOD_EMOJI,
  MOOD_COLORS,
  UNSET_MOOD_COLOR,
  LEGACY_MOODS,
  canonicalMood,
  normalizeCount,
};
