const { load, save, uid, buildSample } = require("../../utils/storage");
const { paintChrome, getSkin, getBackground, DEFAULT_OUTFIT_ID } = require("../../utils/packs");
const { filterToday, summarize, shareText, formatTime, drinkTitle } = require("../../utils/stats");
const { isBaijiuMl, clampQty, normalizeCount, normalizeMl, MAX_COUNT } = require("../../utils/quantity");

const LASER_LINE = "「快乐加一，我代表山姆奥特曼消灭你生命0.5秒」";

function mixHex(hex, toward, amount) {
  const raw = String(hex || "#fff8f1").replace("#", "");
  const channels = [0, 2, 4].map((index) => parseInt(raw.slice(index, index + 2), 16));
  const target = toward === "white" ? 255 : 0;
  const mixed = channels.map((channel) => Math.round(channel + (target - channel) * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

function draftQty(value) {
  return clampQty(value, 0, MAX_COUNT);
}

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
    selected: "smoke",
    smokeQty: "0",
    drinkQty: "0",
    cardIdle: "#fff9f6",
    cardOn: "#b3aea8",
    gag: false,
    gagText: "",
    smokeCount: 0,
    drinkCount: 0,
    baijiuMl: 0,
    today: [],
  },
  onShow() {
    this.refresh();
  },
  onUnload() {
    if (this.timer) clearTimeout(this.timer);
  },
  refresh(patch) {
    patch = patch || {};
    const data = load();
    paintChrome(data);
    const today = filterToday(data.entries).map((entry) => {
      const name = entry.kind === "smoke" ? "烟" : drinkTitle(entry);
      const volume = isBaijiuMl(entry);
      const count = volume ? normalizeMl(entry.count) : normalizeCount(entry.count);
      let title = name;
      if (volume) title = `${name} · 用量 ${count} 毫升`;
      else if (entry.kind === "drink" && entry.drinkType === "白酒") title = `${name} · ${count} 杯`;
      else if (count > 1) title = `${name} ×${count}`;
      return {
        ...entry,
        timeText: formatTime(entry.at),
        title,
        moodText: entry.mood || "未选",
      };
    });
    const summary = summarize(today);
    const skin = getSkin(data.activeSkinId);
    const pending = this._drinkSaved;
    this._drinkSaved = null;
    const smokeQty = patch.smokeQty != null ? patch.smokeQty : this.data.smokeQty;
    const drinkQty = pending ? "0" : this.data.drinkQty;
    const extra = pending
      ? {
          drinkQty: "0",
          freshId: pending.id,
          freshCount: pending.count,
          linkFresh: true,
          draftMood: pending.mood || this.data.draftMood,
        }
      : {};
    this.setData({
      skin,
      bg: getBackground(data.activeBgId),
      cardIdle: mixHex(skin.paper, "white", 0.16),
      cardOn: mixHex(skin.paper, "black", 0.3),
      today,
      smokeQty,
      smokeCount: draftQty(smokeQty),
      drinkCount: draftQty(drinkQty),
      baijiuMl: summary.baijiuMl,
      ...extra,
    });
  },
  markDrinkSaved(info) {
    this._drinkSaved = info;
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
  selectSmoke() {
    this.setData({ selected: "smoke" });
  },
  selectDrink() {
    this.setData({ selected: "drink" });
  },
  onSmokeQty(event) {
    const smokeQty = event.detail.value;
    this.setData({
      smokeQty,
      selected: "smoke",
      smokeCount: draftQty(smokeQty),
    });
  },
  onDrinkQty(event) {
    const drinkQty = event.detail.value;
    this.setData({
      drinkQty,
      selected: "drink",
      drinkCount: draftQty(drinkQty),
    });
  },
  record() {
    if (this.data.selected === "drink") {
      const qty = draftQty(this.data.drinkQty);
      if (qty < 1) return;
      this.goDrink(qty);
      return;
    }
    const qty = draftQty(this.data.smokeQty);
    if (qty < 1) return;
    this.writeSmoke(qty);
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
    this.refresh({ smokeQty: "0" });
    this.setData({
      freshId: entry.id,
      freshCount: safe,
      linkFresh: true,
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
  goDrink(qty) {
    const mood = this.data.draftMood ? `&mood=${encodeURIComponent(this.data.draftMood)}` : "";
    wx.navigateTo({ url: `/pages/drink/drink?qty=${qty}${mood}` });
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
  goSummary() {
    wx.navigateTo({ url: "/pages/summary/summary" });
  },
  shareToday() {
    const data = load();
    const summary = summarize(filterToday(data.entries));
    if (!summary.smokes && !summary.drinks && !summary.baijiuMl) {
      wx.showToast({ title: "今天还是空的", icon: "none" });
      return;
    }
    const now = new Date();
    const title = `今天 · ${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
    wx.setClipboardData({ data: shareText(title, summary) });
  },
});
