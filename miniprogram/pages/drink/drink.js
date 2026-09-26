const { load, save, uid, DRINKS, normalizeCount } = require("../../utils/storage");
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
  onShow() {
    paintChrome(load());
  },
  pickType(event) {
    this.setData({ drinkType: event.currentTarget.dataset.type });
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
    const count = normalizeCount(this.data.qty);
    const drinkLabel = drinkType === "其他" ? (this.data.drinkLabel || "").trim().slice(0, 12) || "其他" : drinkType;
    data.entries.unshift({
      id: uid(),
      kind: "drink",
      at: Date.now(),
      mood: this.data.mood || null,
      drinkType,
      drinkLabel,
      location: (this.data.location || "").trim().slice(0, 24),
      count,
    });
    save(data);
    const line = drinkType === "其他" ? `这杯叫${drinkLabel}，先记下。` : LINES[drinkType];
    wx.showToast({ title: line, icon: "none", duration: 1800 });
    setTimeout(() => wx.navigateBack(), 400);
  },
});
