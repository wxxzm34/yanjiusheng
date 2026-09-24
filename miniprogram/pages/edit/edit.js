const { load, save, DRINKS } = require("../../utils/storage");
const { formatTime } = require("../../utils/stats");
const { paintChrome } = require("../../utils/packs");

Page({
  data: {
    entry: null,
    timeText: "",
    mood: "",
    drinkType: "啤酒",
    drinkLabel: "",
    location: "",
    types: DRINKS,
  },
  onLoad(query) {
    const data = load();
    paintChrome(data);
    const entry = data.entries.find((item) => item.id === query.id);
    if (!entry) {
      wx.navigateBack();
      return;
    }
    this.setData({
      entry,
      timeText: formatTime(entry.at),
      mood: entry.mood || "",
      drinkType: entry.drinkType || "啤酒",
      drinkLabel: entry.drinkType === "其他" ? entry.drinkLabel : "",
      location: entry.location || "",
    });
  },
  onMood(event) {
    this.setData({ mood: event.detail.mood });
  },
  pickType(event) {
    const drinkType = event.currentTarget.dataset.type;
    this.setData({ drinkType, drinkLabel: drinkType === "其他" ? this.data.drinkLabel : drinkType });
  },
  onLabel(event) {
    this.setData({ drinkLabel: event.detail.value });
  },
  onLocation(event) {
    this.setData({ location: event.detail.value });
  },
  saveEdit() {
    const data = load();
    data.entries = data.entries.map((entry) => {
      if (entry.id !== this.data.entry.id) return entry;
      if (entry.kind === "smoke") return { ...entry, mood: this.data.mood || null };
      const drinkType = this.data.drinkType;
      return {
        ...entry,
        mood: this.data.mood || null,
        drinkType,
        drinkLabel: drinkType === "其他" ? (this.data.drinkLabel || "").trim().slice(0, 12) || "其他" : drinkType,
        location: (this.data.location || "").trim().slice(0, 24),
      };
    });
    save(data);
    wx.navigateBack();
  },
});
