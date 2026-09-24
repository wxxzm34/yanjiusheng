const { load } = require("../../utils/storage");
const { paintChrome } = require("../../utils/packs");
const {
  filterMonth,
  filterYear,
  listMonths,
  listYears,
  summarize,
  daySeries,
  monthSeries,
  shareText,
} = require("../../utils/stats");

function moodLine(summary) {
  const parts = ["无聊", "开心", "难过"].filter((mood) => summary.moods[mood] > 0).map((mood) => `${mood} ${summary.moods[mood]}`);
  if (summary.unset) parts.push(`未选 ${summary.unset}`);
  return parts.join(" · ") || "心情还没选";
}

Page({
  data: {
    tab: "month",
    monthLabels: [],
    monthIndex: 0,
    monthTitle: "",
    monthEmpty: true,
    monthSummary: { smokes: 0, drinks: 0 },
    monthDrinks: [],
    monthMood: "",
    days: [],
    yearLabels: [],
    yearIndex: 0,
    yearTitle: "",
    yearEmpty: true,
    yearSummary: { smokes: 0, drinks: 0 },
    yearMonths: [],
    yearMood: "",
  },
  onShow() {
    this.paint();
  },
  paint() {
    const data = load();
    paintChrome(data);
    const now = new Date();
    const months = listMonths(data.entries);
    const years = listYears(data.entries);
    const monthLabels = months.map((item) => item.label);
    let monthIndex = months.findIndex((item) => item.year === now.getFullYear() && item.month === now.getMonth() + 1);
    if (monthIndex < 0) monthIndex = 0;
    const yearLabels = years.map((year) => `${year}年`);
    let yearIndex = years.indexOf(now.getFullYear());
    if (yearIndex < 0) yearIndex = 0;
    this.setData({
      monthLabels,
      monthIndex: months.length ? monthIndex : 0,
      yearLabels,
      yearIndex: years.length ? yearIndex : 0,
    });
    this.showMonth(data.entries, now.getFullYear(), now.getMonth() + 1);
    this.showYear(data.entries, now.getFullYear());
  },
  showMonth(entries, year, month) {
    const scoped = filterMonth(entries, year, month);
    const summary = summarize(scoped);
    const max = Math.max(1, ...daySeries(entries, year, month).map((day) => day.smokes));
    this.setData({
      monthTitle: `${year}年${month}月`,
      monthEmpty: scoped.length === 0,
      monthSummary: summary,
      monthDrinks: summary.byDrink.filter((item) => item.count > 0),
      monthMood: moodLine(summary),
      days: daySeries(entries, year, month).map((day) => ({
        day: day.day,
        height: Math.round((day.smokes / max) * 120),
      })),
    });
  },
  showYear(entries, year) {
    const scoped = filterYear(entries, year);
    const summary = summarize(scoped);
    this.setData({
      yearTitle: `${year}年`,
      yearEmpty: scoped.length === 0,
      yearSummary: summary,
      yearMonths: monthSeries(entries, year),
      yearMood: moodLine(summary),
    });
  },
  switchTab(event) {
    this.setData({ tab: event.currentTarget.dataset.tab });
  },
  onMonth(event) {
    const data = load();
    const months = listMonths(data.entries);
    const picked = months[Number(event.detail.value)];
    if (!picked) return;
    this.setData({ monthIndex: Number(event.detail.value) });
    this.showMonth(data.entries, picked.year, picked.month);
  },
  onYear(event) {
    const data = load();
    const years = listYears(data.entries);
    const year = years[Number(event.detail.value)];
    if (!year) return;
    this.setData({ yearIndex: Number(event.detail.value) });
    this.showYear(data.entries, year);
  },
  shareCurrent() {
    const data = load();
    const now = new Date();
    if (this.data.tab === "year") {
      const year = Number(String(this.data.yearTitle).replace("年", "")) || now.getFullYear();
      const summary = summarize(filterYear(data.entries, year));
      if (!filterYear(data.entries, year).length) {
        wx.showToast({ title: "这一年还是空的", icon: "none" });
        return;
      }
      wx.setClipboardData({ data: shareText(`${year}年`, summary) });
      return;
    }
    const title = this.data.monthTitle || `${now.getFullYear()}年${now.getMonth() + 1}月`;
    const matched = title.match(/(\d+)年(\d+)月/);
    const year = matched ? Number(matched[1]) : now.getFullYear();
    const month = matched ? Number(matched[2]) : now.getMonth() + 1;
    const scoped = filterMonth(data.entries, year, month);
    if (!scoped.length) {
      wx.showToast({ title: "这个月还是空的", icon: "none" });
      return;
    }
    wx.setClipboardData({ data: shareText(title, summarize(scoped)) });
  },
});
