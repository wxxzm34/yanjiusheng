const KEY = "yanjiusheng.subscribe";

function defaults() {
  return {
    daily: false,
    monthly: false,
    yearly: false,
    hour: 21,
    minute: 0,
    monthDay: 1,
    yearMonth: 1,
    yearDay: 1,
    updatedAt: 0,
  };
}

function clamp(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min || number > max) return fallback;
  return number;
}

function loadPrefs() {
  try {
    const raw = wx.getStorageSync(KEY);
    if (!raw || typeof raw !== "object") return defaults();
    const base = defaults();
    return {
      daily: Boolean(raw.daily),
      monthly: Boolean(raw.monthly),
      yearly: Boolean(raw.yearly),
      hour: clamp(raw.hour, 0, 23, base.hour),
      minute: clamp(raw.minute, 0, 59, base.minute),
      monthDay: clamp(raw.monthDay, 1, 31, base.monthDay),
      yearMonth: clamp(raw.yearMonth, 1, 12, base.yearMonth),
      yearDay: clamp(raw.yearDay, 1, 31, base.yearDay),
      updatedAt: typeof raw.updatedAt === "number" ? raw.updatedAt : 0,
    };
  } catch (error) {
    return defaults();
  }
}

function writePrefs(prefs, updatedAt) {
  const base = defaults();
  const next = {
    daily: Boolean(prefs.daily),
    monthly: Boolean(prefs.monthly),
    yearly: Boolean(prefs.yearly),
    hour: clamp(prefs.hour, 0, 23, base.hour),
    minute: clamp(prefs.minute, 0, 59, base.minute),
    monthDay: clamp(prefs.monthDay, 1, 31, base.monthDay),
    yearMonth: clamp(prefs.yearMonth, 1, 12, base.yearMonth),
    yearDay: clamp(prefs.yearDay, 1, 31, base.yearDay),
    updatedAt: typeof updatedAt === "number" ? updatedAt : Date.now(),
  };
  wx.setStorageSync(KEY, next);
  return next;
}

module.exports = { loadPrefs, writePrefs };
