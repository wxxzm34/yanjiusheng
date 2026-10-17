const { isBaijiuMl, normalizeCount } = require("../../utils/quantity");

const SMOKE = "#e25b3a";
const DRINK = "#3c7d9e";
const INK = "#7a6558";
const GRID = "rgba(43, 33, 24, 0.08)";

function startOfDay(date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date, count) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function dayKey(date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
}

function dayLabel(date) {
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

function eachDay(start, end) {
  const days = [];
  const cursor = startOfDay(start);
  const last = startOfDay(end).getTime();
  while (cursor.getTime() <= last) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function windowFor(range, now) {
  const today = startOfDay(now || Date.now());
  if (range === "year") {
    return { mode: "year", year: today.getFullYear() };
  }
  if (range === "month") {
    const year = today.getFullYear();
    const month = today.getMonth();
    return {
      mode: "day",
      start: new Date(year, month, 1),
      end: new Date(year, month + 1, 0),
    };
  }
  const length = range === "d7" ? 7 : 30;
  return { mode: "day", start: addDays(today, 1 - length), end: today };
}

function bump(bucket, entry) {
  if (!bucket || !entry || isBaijiuMl(entry)) return;
  const count = normalizeCount(entry.count);
  if (entry.kind === "smoke") bucket.smokes += count;
  else if (entry.kind === "drink") bucket.drinks += count;
}

function rangeSeries(entries, range, now) {
  const list = entries || [];
  const span = windowFor(range, now);
  let buckets;
  if (span.mode === "year") {
    buckets = [];
    for (let month = 1; month <= 12; month += 1) {
      buckets.push({ key: `${span.year}-${month}`, label: `${month}月`, smokes: 0, drinks: 0 });
    }
    list.forEach((entry) => {
      const date = new Date(entry.at);
      if (date.getFullYear() !== span.year) return;
      bump(buckets[date.getMonth()], entry);
    });
  } else {
    buckets = eachDay(span.start, span.end).map((date) => ({
      key: dayKey(date),
      label: dayLabel(date),
      smokes: 0,
      drinks: 0,
    }));
    const index = {};
    buckets.forEach((bucket, i) => {
      index[bucket.key] = i;
    });
    list.forEach((entry) => {
      if (!entry || typeof entry.at !== "number") return;
      bump(buckets[index[dayKey(new Date(entry.at))]], entry);
    });
  }
  const smokes = buckets.map((bucket) => bucket.smokes);
  const drinks = buckets.map((bucket) => bucket.drinks);
  return {
    labels: buckets.map((bucket) => bucket.label),
    smokes,
    drinks,
    smokeTotal: smokes.reduce((sum, value) => sum + value, 0),
    drinkTotal: drinks.reduce((sum, value) => sum + value, 0),
  };
}

function entryInRange(entry, range, now) {
  if (!entry || typeof entry.at !== "number") return false;
  const span = windowFor(range, now);
  const date = new Date(entry.at);
  if (span.mode === "year") return date.getFullYear() === span.year;
  const day = startOfDay(date).getTime();
  return day >= startOfDay(span.start).getTime() && day <= startOfDay(span.end).getTime();
}

function summaryLine(range, smokes, drinks, baijiuMl) {
  const prefix = {
    month: "本月",
    year: "本年",
    d7: "最近 7 天",
    d30: "最近 30 天",
  }[range];
  const volume = baijiuMl > 0 ? `，白酒用量 ${baijiuMl} 毫升` : "";
  return `${prefix}共抽烟 ${smokes} 根，喝酒 ${drinks} 两/杯${volume}`;
}

function labelInterval(count) {
  if (count <= 8) return 0;
  if (count <= 16) return 1;
  return 4;
}

function axisMax(values) {
  const max = values.reduce((peak, value) => (value > peak ? value : peak), 0);
  return max === 0 ? 1 : null;
}

function categoryAxis(labels) {
  return {
    type: "category",
    data: labels,
    boundaryGap: false,
    axisLine: { lineStyle: { color: GRID } },
    axisTick: { show: false },
    axisLabel: {
      color: INK,
      fontSize: 10,
      interval: labelInterval(labels.length),
    },
  };
}

function valueAxis(name, color, values, showSplit) {
  const axis = {
    type: "value",
    name,
    min: 0,
    minInterval: 1,
    splitNumber: 3,
    nameTextStyle: { color, fontSize: 10 },
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color, fontSize: 10 },
    splitLine: showSplit ? { lineStyle: { color: GRID } } : { show: false },
  };
  const max = axisMax(values);
  if (max != null) axis.max = max;
  return axis;
}

function lineSeries(name, color, data, yAxisIndex, mark) {
  const crowded = data.length > 16;
  return {
    name,
    type: "line",
    yAxisIndex,
    data,
    smooth: false,
    showSymbol: !crowded,
    symbol: mark.symbol,
    symbolSize: crowded ? 4 : mark.size,
    symbolOffset: mark.offset,
    lineStyle: { width: 2, color, type: mark.dash ? "dashed" : "solid" },
    itemStyle: { color, borderColor: "#fffaf6", borderWidth: 1.5 },
  };
}

const SMOKE_MARK = { symbol: "circle", size: 8, offset: [0, 0], dash: false };
const DRINK_MARK = { symbol: "diamond", size: 9, offset: [0, 0], dash: false };
const SMOKE_PAIR = { symbol: "circle", size: 8, offset: [0, -8], dash: false };
const DRINK_PAIR = { symbol: "diamond", size: 9, offset: [0, 8], dash: true };

function baseOption() {
  return {
    animationDuration: 280,
    tooltip: {
      trigger: "axis",
      confine: true,
      textStyle: { fontSize: 12 },
    },
    grid: { left: 8, right: 12, top: 36, bottom: 8, containLabel: true },
  };
}

function dayLineOption(series) {
  return Object.assign(baseOption(), {
    color: [SMOKE, DRINK],
    legend: {
      top: 0,
      right: 0,
      itemWidth: 14,
      itemHeight: 10,
      textStyle: { color: INK, fontSize: 11 },
      data: [
        { name: "香烟", icon: "circle" },
        { name: "酒", icon: "diamond" },
      ],
    },
    xAxis: categoryAxis(series.labels),
    yAxis: [
      valueAxis("香烟 (根)", SMOKE, series.smokes, true),
      valueAxis("酒 (两/杯)", DRINK, series.drinks, false),
    ],
    series: [
      lineSeries("香烟", SMOKE, series.smokes, 0, SMOKE_PAIR),
      lineSeries("酒", DRINK, series.drinks, 1, DRINK_PAIR),
    ],
  });
}

function singleLineOption(title, name, color, labels, data, mark) {
  return Object.assign(baseOption(), {
    color: [color],
    title: {
      text: title,
      left: 4,
      top: 0,
      textStyle: { color: "#2b2118", fontSize: 13, fontWeight: 600 },
    },
    xAxis: categoryAxis(labels),
    yAxis: valueAxis(name, color, data, true),
    series: [lineSeries(title, color, data, 0, mark)],
  });
}

function yearSmokeOption(series) {
  return singleLineOption("香烟", "根", SMOKE, series.labels, series.smokes, SMOKE_MARK);
}

function yearDrinkOption(series) {
  return singleLineOption("酒", "两/杯", DRINK, series.labels, series.drinks, DRINK_MARK);
}

module.exports = {
  rangeSeries,
  entryInRange,
  summaryLine,
  dayLineOption,
  yearSmokeOption,
  yearDrinkOption,
};
