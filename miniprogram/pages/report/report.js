const echarts = require("../../ec-canvas/echarts");
const { load } = require("../../utils/storage");
const { paintChrome } = require("../../utils/packs");
const { summarize, shareText } = require("../../utils/stats");
const {
  rangeSeries,
  entryInRange,
  summaryLine,
  dayLineOption,
  yearSmokeOption,
  yearDrinkOption,
} = require("./chart-options");

function shareTitle(range, now) {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  if (range === "year") return `${year}年`;
  if (range === "month") return `${year}年${month}月`;
  if (range === "d7") return "最近 7 天";
  return "最近 30 天";
}

function mountChart(canvas, width, height, dpr, option) {
  const chart = echarts.init(canvas, null, {
    width,
    height,
    devicePixelRatio: dpr,
  });
  canvas.setChart(chart);
  chart.setOption(option);
  return chart;
}

Page({
  data: {
    range: "month",
    ranges: [
      { id: "month", label: "本月" },
      { id: "year", label: "本年" },
      { id: "d7", label: "最近 7 天" },
      { id: "d30", label: "最近 30 天" },
    ],
    summaryText: "本月共抽烟 0 根，喝酒 0 两/杯",
    dayEc: { lazyLoad: true },
    smokeEc: { lazyLoad: true },
    drinkEc: { lazyLoad: true },
  },
  onLoad() {
    this.entries = [];
    this.series = null;
    this.charts = {};
    this.pending = {};
    this.latest = {};
    this.viewReady = false;
  },
  onShow() {
    const data = load();
    paintChrome(data);
    this.entries = data.entries || [];
    this.refresh();
  },
  onReady() {
    this.viewReady = true;
    this.paintCharts();
  },
  refresh() {
    const series = rangeSeries(this.entries, this.data.range, new Date());
    this.series = series;
    this.setData(
      { summaryText: summaryLine(this.data.range, series.smokeTotal, series.drinkTotal) },
      () => {
        if (this.viewReady) this.paintCharts();
      },
    );
  },
  switchRange(event) {
    const range = event.currentTarget.dataset.range;
    if (!range || range === this.data.range) return;
    this.charts = {};
    this.pending = {};
    this.setData({ range }, () => this.refresh());
  },
  paintCharts() {
    if (!this.viewReady || !this.series) return;
    const series = this.series;
    if (this.data.range === "year") {
      this.initOne("#year-smoke", "smoke", yearSmokeOption(series), () => {
        this.initOne("#year-drink", "drink", yearDrinkOption(series));
      });
      return;
    }
    this.initOne("#day-chart", "day", dayLineOption(series));
  },
  initOne(selector, key, option, done) {
    this.latest[key] = option;
    const comp = this.selectComponent(selector);
    if (!comp) return;
    if (this.charts[key]) {
      this.charts[key].setOption(option, true);
      if (done) done();
      return;
    }
    if (this.pending[key]) return;
    this.pending[key] = true;
    comp.init((canvas, width, height, dpr) => {
      const chart = mountChart(canvas, width, height, dpr, this.latest[key]);
      this.charts[key] = chart;
      this.pending[key] = false;
      if (done) done();
      return chart;
    });
  },
  shareCurrent() {
    const now = new Date();
    const scoped = (this.entries || []).filter((entry) => entryInRange(entry, this.data.range, now));
    if (!scoped.length) {
      wx.showToast({ title: "这段还是空的", icon: "none" });
      return;
    }
    wx.setClipboardData({ data: shareText(shareTitle(this.data.range, now), summarize(scoped)) });
  },
});
