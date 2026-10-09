const share = require("../../utils/share");
const { load, save, uid, DRINKS, normalizeCount, canonicalMood } = require("../../utils/storage");
const { DEFAULT_BAIJIU_ML, normalizeMl } = require("../../utils/quantity");
const { paintChrome } = require("../../utils/packs");

const LINES = {
  红酒: "晃一晃，今晚的月亮是葡萄味。",
  白酒: "小口，哈——暖到耳朵了。",
  啤酒: "泡沫先戴上皇冠。",
  家酿: "这罐是自己的季节。",
  黄酒: "甜一点的老时光。",
};

Page({
  data: {
    types: DRINKS,
    drinkType: "啤酒",
    drinkLabel: "",
    location: "",
    mood: "",
    qty: "1",
  },
  onLoad(query) {
    const mood = canonicalMood(query && query.mood);
    const cups = normalizeCount(query && query.qty);
    this._cupQty = cups;
    const next = { qty: String(cups) };
    if (mood) next.mood = mood;
    this.setData(next);
  },
  onShow() {
    share.enableShare();
    paintChrome(load());
  },
  onShareAppMessage() {
    return share.onShareAppMessage();
  },
  onShareTimeline() {
    return share.onShareTimeline();
  },
  pickType(event) {
    const drinkType = event.currentTarget.dataset.type;
    const patch = { drinkType };
    if (drinkType === "白酒" && this.data.drinkType !== "白酒") patch.qty = String(DEFAULT_BAIJIU_ML);
    if (drinkType !== "白酒" && this.data.drinkType === "白酒") patch.qty = String(this._cupQty || 1);
    this.setData(patch);
  },
  onLabel(event) {
    this.setData({ drinkLabel: event.detail.value });
  },
  onLocation(event) {
    this.setData({ location: event.detail.value });
  },
  onMood(event) {
    this.setData({ mood: event.detail.mood });
  },
  onQty(event) {
    this.setData({ qty: event.detail.value });
  },
  saveDrink() {
    const data = load();
    const drinkType = this.data.drinkType;
    const volume = drinkType === "白酒";
    const count = volume ? normalizeMl(this.data.qty) : normalizeCount(this.data.qty);
    const drinkLabel = drinkType === "其他" ? (this.data.drinkLabel || "").trim().slice(0, 12) || "其他" : drinkType;
    const id = uid();
    data.entries.unshift({
      id,
      kind: "drink",
      at: Date.now(),
      mood: this.data.mood || null,
      drinkType,
      drinkLabel,
      location: (this.data.location || "").trim().slice(0, 24),
      count,
      ...(volume ? { unit: "ml" } : {}),
    });
    save(data);
    const pages = getCurrentPages();
    const prev = pages[pages.length - 2];
    if (prev && prev.markDrinkSaved) prev.markDrinkSaved({ id, count: volume ? 1 : count, mood: this.data.mood || "" });
    const line = drinkType === "其他" ? `这杯叫${drinkLabel}，先记下。` : LINES[drinkType];
    wx.showToast({ title: line, icon: "none", duration: 1800 });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
