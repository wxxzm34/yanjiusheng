const { MOODS, DRINKS } = require("./storage");
const { canonicalMood, isBaijiuMl, normalizeCount, normalizeMl } = require("./quantity");

function startOfDay(ts) {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

function pad(value) {
  return String(value).padStart(2, "0");
}

function formatTime(ts) {
  const date = new Date(ts);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDayLabel(ts, now) {
  const diff = Math.round((startOfDay(now || Date.now()) - startOfDay(ts)) / 86400000);
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

function emptyMoods() {
  const moods = {};
  MOODS.forEach((mood) => {
    moods[mood] = 0;
  });
  return moods;
}

function summarize(entries) {
  const moods = emptyMoods();
  let unset = 0;
  let smokes = 0;
  let drinks = 0;
  const byDrink = DRINKS.map((type) => ({ type, count: 0, ml: 0, labels: [] }));
  const others = {};
  let baijiuMl = 0;
  entries.forEach((entry) => {
    const mood = canonicalMood(entry.mood);
    if (isBaijiuMl(entry)) {
      const ml = normalizeMl(entry.count);
      baijiuMl += ml;
      const bucket = byDrink.find((item) => item.type === "白酒");
      if (bucket) bucket.ml += ml;
      if (mood && moods[mood] !== undefined) moods[mood] += 1;
      else unset += 1;
      return;
    }
    const count = normalizeCount(entry.count);
    if (mood && moods[mood] !== undefined) moods[mood] += count;
    else unset += count;
    if (entry.kind === "smoke") {
      smokes += count;
      return;
    }
    drinks += count;
    const bucket = byDrink.find((item) => item.type === entry.drinkType);
    if (!bucket) return;
    bucket.count += count;
    if (entry.drinkType === "其他") {
      const label = (entry.drinkLabel || "其他").trim() || "其他";
      others[label] = (others[label] || 0) + count;
    }
  });
  const otherBucket = byDrink.find((item) => item.type === "其他");
  if (otherBucket) {
    otherBucket.labels = Object.keys(others).map((label) => ({ label, count: others[label] }));
  }
  return { smokes, drinks, baijiuMl, moods, unset, byDrink };
}

function filterToday(entries, now) {
  const day = startOfDay(now || Date.now());
  return entries.filter((entry) => startOfDay(entry.at) === day);
}

function filterMonth(entries, year, month) {
  return entries.filter((entry) => {
    const date = new Date(entry.at);
    return date.getFullYear() === year && date.getMonth() + 1 === month;
  });
}

function filterYear(entries, year) {
  return entries.filter((entry) => new Date(entry.at).getFullYear() === year);
}

function listMonths(entries) {
  const map = {};
  entries.forEach((entry) => {
    const date = new Date(entry.at);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    map[`${year}-${month}`] = { year, month, key: `${year}-${month}`, label: `${year}年${month}月` };
  });
  return Object.keys(map)
    .map((key) => map[key])
    .sort((a, b) => b.year - a.year || b.month - a.month);
}

function listYears(entries) {
  const years = {};
  entries.forEach((entry) => {
    years[new Date(entry.at).getFullYear()] = true;
  });
  return Object.keys(years)
    .map(Number)
    .sort((a, b) => b - a);
}

function daySeries(entries, year, month) {
  const total = new Date(year, month, 0).getDate();
  const days = [];
  for (let day = 1; day <= total; day += 1) days.push({ day, smokes: 0, drinks: 0 });
  entries.forEach((entry) => {
    const date = new Date(entry.at);
    if (date.getFullYear() !== year || date.getMonth() + 1 !== month) return;
    const point = days[date.getDate() - 1];
    if (!point) return;
    if (isBaijiuMl(entry)) return;
    const count = normalizeCount(entry.count);
    if (entry.kind === "smoke") point.smokes += count;
    else point.drinks += count;
  });
  return days;
}

function monthSeries(entries, year) {
  const points = [];
  for (let month = 1; month <= 12; month += 1) points.push({ month, smokes: 0, drinks: 0 });
  entries.forEach((entry) => {
    const date = new Date(entry.at);
    if (date.getFullYear() !== year) return;
    const point = points[date.getMonth()];
    if (isBaijiuMl(entry)) return;
    const count = normalizeCount(entry.count);
    if (entry.kind === "smoke") point.smokes += count;
    else point.drinks += count;
  });
  return points;
}

function drinkTitle(entry) {
  if (entry.drinkType === "其他") return (entry.drinkLabel || "其他").trim() || "其他";
  return entry.drinkType;
}

function formatDrinkPart(item) {
  if (item.type === "其他" && item.labels && item.labels.length) {
    return item.labels.map((label) => `${label.label} ${label.count}`).join(" · ");
  }
  if (item.type === "白酒") {
    const bits = [];
    if (item.count > 0) bits.push(`白酒 ${item.count} 杯`);
    if (item.ml > 0) bits.push(`用量 ${item.ml} 毫升`);
    return bits.join(" · ");
  }
  return `${item.type} ${item.count}`;
}

function shareText(title, summary) {
  const drinks = summary.byDrink
    .filter((item) => item.count > 0 || item.ml > 0)
    .map((item) => formatDrinkPart(item))
    .join(" · ");
  const moods = MOODS.filter((mood) => summary.moods[mood] > 0).map((mood) => `${mood} ${summary.moods[mood]}`);
  if (summary.unset > 0) moods.push(`未选 ${summary.unset}`);
  const lines = [`烟酒生 · ${title}`, `烟 ${summary.smokes} 支`, `酒 ${summary.drinks} 杯`];
  if (summary.baijiuMl > 0) lines.push(`白酒用量 ${summary.baijiuMl} 毫升`);
  if (drinks) lines.push(drinks);
  lines.push(moods.length ? `心情 ${moods.join(" · ")}` : "心情还没选");
  lines.push("轻轻记下，不打分。");
  return lines.join("\n");
}

function groupByDay(entries) {
  const sorted = entries.slice().sort((a, b) => b.at - a.at);
  const groups = [];
  sorted.forEach((entry) => {
    const day = startOfDay(entry.at);
    const last = groups[groups.length - 1];
    const volume = isBaijiuMl(entry);
    const count = volume ? normalizeMl(entry.count) : normalizeCount(entry.count);
    const mood = canonicalMood(entry.mood);
    const name = entry.kind === "smoke" ? "烟" : drinkTitle(entry);
    let title = name;
    if (volume) title = `${name} · 用量 ${count} 毫升`;
    else if (entry.kind === "drink" && entry.drinkType === "白酒") title = `${name} · ${count} 杯`;
    else if (count > 1) title = `${name} ×${count}`;
    const view = {
      ...entry,
      mood,
      count,
      timeText: formatTime(entry.at),
      title,
      moodText: mood || "未选",
      place: entry.kind === "drink" ? entry.location || "地点空着" : count > 1 ? `${count} 支烟` : "一支烟",
    };
    const cupAdd = entry.kind === "drink" && !volume ? count : 0;
    const mlAdd = volume ? count : 0;
    const smokeAdd = entry.kind === "smoke" ? count : 0;
    if (!last || last.day !== day) {
      groups.push({
        day,
        label: formatDayLabel(entry.at),
        entries: [view],
        smokes: smokeAdd,
        drinks: cupAdd,
        baijiuMl: mlAdd,
      });
    } else {
      last.entries.push(view);
      last.smokes += smokeAdd;
      last.drinks += cupAdd;
      last.baijiuMl += mlAdd;
    }
  });
  return groups;
}

module.exports = {
  startOfDay,
  formatTime,
  summarize,
  filterToday,
  filterMonth,
  filterYear,
  listMonths,
  listYears,
  daySeries,
  monthSeries,
  drinkTitle,
  shareText,
  groupByDay,
};
