const MAX_COUNT = 99;
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
  MOOD_EMOJI,
  MOOD_COLORS,
  UNSET_MOOD_COLOR,
  LEGACY_MOODS,
  canonicalMood,
  normalizeCount,
};
