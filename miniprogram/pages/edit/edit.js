const share = require("../../utils/share");
const { load, save, DRINKS, cleanNote } = require("../../utils/storage");
const { DEFAULT_BAIJIU_ML, isBaijiuMl, normalizeCount, normalizeMl } = require("../../utils/quantity");

function heading(entry) {
  if (!entry || entry.kind === "smoke") {
    return entry && entry.count > 1 ? `改这 ${normalizeCount(entry.count)} 支烟` : "改这支烟";
  }
  if (isBaijiuMl(entry)) return `改用量 ${normalizeMl(entry.count)} 毫升`;
  if (entry.drinkType === "白酒") return `改这 ${normalizeCount(entry.count)} 杯白酒`;
  return entry.count > 1 ? `改这 ${normalizeCount(entry.count)} 杯酒` : "改这杯酒";
}

function noteFor(entry) {
  if (entry && entry.kind === "drink" && entry.drinkType === "白酒" && !isBaijiuMl(entry)) {
    return "这条是按杯记下的，数字还是杯，没有改成毫升。";
  }
  if (isBaijiuMl(entry)) return `用量 ${normalizeMl(entry.count)} 毫升`;
  return "";
}
const { formatTime } = require("../../utils/stats");
const { paintChrome } = require("../../utils/packs");

Page({
  data: {
    entry: null,
    timeText: "",
    mood: "",
    moodNote: "",
    drinkType: "啤酒",
    drinkLabel: "",
    location: "",
    types: DRINKS,
    title: "",
    unitNote: "",
  },
  onShow() {
    share.enableShare();
  },
  onShareAppMessage() {
    return share.onShareAppMessage();
  },
  onShareTimeline() {
    return share.onShareTimeline();
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
      moodNote: entry.note || "",
      drinkType: entry.drinkType || "啤酒",
      drinkLabel: entry.drinkType === "其他" ? entry.drinkLabel : "",
      location: entry.location || "",
      title: heading(entry),
      unitNote: noteFor(entry),
    });
  },
  onMood(event) {
    this.setData({ mood: event.detail.mood });
  },
  onNote(event) {
    this.data.moodNote = event.detail.value || "";
  },
  pickType(event) {
    const drinkType = event.currentTarget.dataset.type;
    const entry = { ...this.data.entry, drinkType };
    if (drinkType === "白酒" && this.data.entry.drinkType !== "白酒") {
      entry.unit = "ml";
      entry.count = DEFAULT_BAIJIU_ML;
    } else if (drinkType !== "白酒" && this.data.entry.unit === "ml") {
      entry.unit = "cup";
      entry.count = 1;
    }
    entry.drinkLabel = drinkType === "其他" ? this.data.drinkLabel : drinkType;
    this.setData({
      entry,
      drinkType,
      drinkLabel: entry.drinkLabel,
      title: heading(entry),
      unitNote: noteFor(entry),
    });
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
      const note = cleanNote(this.data.moodNote);
      if (entry.kind === "smoke") {
        const next = { ...entry, mood: this.data.mood || null };
        if (note) next.note = note;
        else delete next.note;
        return next;
      }
      const drinkType = this.data.drinkType;
      const next = {
        ...entry,
        mood: this.data.mood || null,
        drinkType,
        drinkLabel: drinkType === "其他" ? (this.data.drinkLabel || "").trim().slice(0, 12) || "其他" : drinkType,
        location: (this.data.location || "").trim().slice(0, 24),
        count: this.data.entry.count,
      };
      if (drinkType === "白酒") next.unit = this.data.entry.unit === "ml" ? "ml" : "cup";
      else delete next.unit;
      if (note) next.note = note;
      else delete next.note;
      return next;
    });
    save(data);
    wx.navigateBack();
  },
});
