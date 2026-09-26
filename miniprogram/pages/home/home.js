const { load, save, uid, buildSample, normalizeCount } = require("../../utils/storage");
const { paintChrome, getSkin, getBackground, DEFAULT_OUTFIT_ID } = require("../../utils/packs");
const { filterToday, summarize, shareText, formatTime, drinkTitle } = require("../../utils/stats");

const LASER_LINE = "「快乐加一，我代表山姆奥特曼消灭你生命0.5秒」";

function greeting() {
  const hour = new Date().getHours();
  if (hour < 5) return "夜深了，醒着就轻轻记一笔";
  if (hour < 11) return "早上好，小本本翻开了";
  if (hour < 14) return "中午好，想记就记";
  if (hour < 18) return "下午好";
  return "晚上好";
}

Page({
  data: {
    greeting: greeting(),
    skin: getSkin(DEFAULT_OUTFIT_ID),
    bg: getBackground(DEFAULT_OUTFIT_ID),
    draftMood: "",
    linkFresh: false,
    freshId: "",
    freshCount: 1,
    smokeQty: "1",
    gag: false,
    gagText: "",
    smokeCount: 0,
    drinkCount: 0,
    today: [],
  },
  onShow() {
    this.refresh();
  },
  onUnload() {
    if (this.timer) clearTimeout(this.timer);
  },
  refresh() {
    const data = load();
    paintChrome(data);
    const today = filterToday(data.entries).map((entry) => {
      const name = entry.kind === "smoke" ? "烟" : drinkTitle(entry);
      const count = entry.count || 1;
      return {
        ...entry,
        timeText: formatTime(entry.at),
        title: count > 1 ? `${name} ×${count}` : name,
        moodText: entry.mood || "未选",
      };
    });
    const summary = summarize(today);
    this.setData({
      skin: getSkin(data.activeSkinId),
      bg: getBackground(data.activeBgId),
      today,
      smokeCount: summary.smokes,
      drinkCount: summary.drinks,
    });
  },
  onMood(event) {
    const mood = event.detail.mood;
    this.setData({ draftMood: mood });
    if (!this.data.linkFresh || !this.data.freshId) return;
    const data = load();
    data.entries = data.entries.map((entry) =>
      entry.id === this.data.freshId ? { ...entry, mood: mood || null } : entry,
    );
    save(data);
    this.refresh();
    this.setData({ draftMood: mood, linkFresh: true, freshId: this.data.freshId });
  },
  onSmokeQty(event) {
    this.setData({ smokeQty: event.detail.value });
  },
  logSmoke() {
    this.writeSmoke(1);
  },
  logSmokeBatch() {
    this.writeSmoke(this.data.smokeQty);
  },
  writeSmoke(count) {
    const safe = normalizeCount(count);
    const data = load();
    const entry = {
      id: uid(),
      kind: "smoke",
      at: Date.now(),
      mood: this.data.draftMood || null,
      count: safe,
    };
    data.entries.unshift(entry);
    save(data);
    if (this.timer) clearTimeout(this.timer);
    this.refresh();
    this.setData({
      freshId: entry.id,
      freshCount: safe,
      linkFresh: true,
      smokeQty: safe > 1 ? "1" : String(normalizeCount(this.data.smokeQty)),
      gag: true,
      gagText: LASER_LINE,
      draftMood: this.data.draftMood,
    });
    this.timer = setTimeout(() => this.skipGag(), 3600);
  },
  skipGag() {
    if (this.timer) clearTimeout(this.timer);
    this.setData({ gag: false, gagText: "" });
  },
  freezeMood() {
    this.setData({ linkFresh: false });
  },
  goDrink() {
    const mood = this.data.draftMood ? `?mood=${encodeURIComponent(this.data.draftMood)}` : "";
    wx.navigateTo({ url: `/pages/drink/drink${mood}` });
  },
  loadSample() {
    const data = load();
    const run = () => {
      data.entries = buildSample(Date.now());
      save(data);
      this.refresh();
    };
    if (data.entries.length) {
      wx.showModal({
        title: "换成示例？",
        content: "现在的记录会被替掉，之后可以清空。",
        success: (res) => {
          if (res.confirm) run();
        },
      });
      return;
    }
    run();
  },
  shareToday() {
    const data = load();
    const summary = summarize(filterToday(data.entries));
    if (!summary.smokes && !summary.drinks) {
      wx.showToast({ title: "今天还是空的", icon: "none" });
      return;
    }
    const now = new Date();
    const title = `今天 · ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    wx.setClipboardData({ data: shareText(title, summary) });
  },
});
