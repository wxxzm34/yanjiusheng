const { load, save, buildSample } = require("../../utils/storage");
const { SKINS, BACKGROUNDS, getSkin, getBackground, paintChrome } = require("../../utils/packs");

Page({
  data: {
    skin: getSkin("skin-star"),
    bg: getBackground("bg-lamp"),
    skins: [],
    backgrounds: [],
    pendingId: "",
  },
  onShow() {
    this.paint();
  },
  paint() {
    const data = load();
    paintChrome(data);
    const pendingId = this.data.pendingId;
    this.setData({
      skin: getSkin(data.activeSkinId),
      bg: getBackground(data.activeBgId),
      skins: SKINS.map((item) => ({
        ...item,
        unlocked: data.unlockedIds.indexOf(item.id) >= 0,
        active: data.activeSkinId === item.id,
        pending: pendingId === item.id,
      })),
      backgrounds: BACKGROUNDS.map((item) => ({
        ...item,
        unlocked: data.unlockedIds.indexOf(item.id) >= 0,
        active: data.activeBgId === item.id,
        pending: pendingId === item.id,
      })),
    });
  },
  act(event) {
    const id = event.currentTarget.dataset.id;
    const kind = event.currentTarget.dataset.kind;
    const data = load();
    const unlocked = data.unlockedIds.indexOf(id) >= 0;
    const active = kind === "skin" ? data.activeSkinId === id : data.activeBgId === id;
    if (active) return;
    if (!unlocked) {
      this.setData({ pendingId: id });
      this.paint();
      setTimeout(() => {
        const next = load();
        if (next.unlockedIds.indexOf(id) < 0) next.unlockedIds.push(id);
        save(next);
        this.setData({ pendingId: "" });
        this.paint();
        wx.showToast({ title: "下载好了", icon: "none" });
      }, 700);
      return;
    }
    if (kind === "skin") data.activeSkinId = id;
    else data.activeBgId = id;
    save(data);
    this.paint();
  },
  sample() {
    const data = load();
    const run = () => {
      data.entries = buildSample(Date.now());
      save(data);
      wx.showToast({ title: "示例放好了", icon: "none" });
    };
    if (!data.entries.length) {
      run();
      return;
    }
    wx.showModal({
      title: "换成示例？",
      content: "现在的记录会被替掉。",
      success: (res) => {
        if (res.confirm) run();
      },
    });
  },
  clearAll() {
    wx.showModal({
      title: "清空全部记录？",
      content: "装扮还会留着。",
      success: (res) => {
        if (!res.confirm) return;
        const data = load();
        data.entries = [];
        save(data);
        wx.showToast({ title: "清掉了", icon: "none" });
      },
    });
  },
});
