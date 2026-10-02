const { load, save, buildSample } = require("../../utils/storage");
const { OUTFITS, getSkin, getBackground, paintChrome, DEFAULT_OUTFIT_ID } = require("../../utils/packs");

Page({
  data: {
    skin: getSkin(DEFAULT_OUTFIT_ID),
    bg: getBackground(DEFAULT_OUTFIT_ID),
    outfits: [],
    pendingId: "",
  },
  onShow() {
    this.paint();
  },
  paint() {
    const data = load();
    paintChrome(data);
    const pendingId = this.data.pendingId;
    const skin = getSkin(data.activeSkinId);
    this.setData({
      skin,
      bg: getBackground(data.activeBgId),
      outfits: OUTFITS.map((item) => ({
        ...item,
        unlocked: data.unlockedIds.indexOf(item.id) >= 0,
        active: skin.id === item.id,
        pending: pendingId === item.id,
      })),
    });
  },
  act(event) {
    const id = event.currentTarget.dataset.id;
    const data = load();
    const unlocked = data.unlockedIds.indexOf(id) >= 0;
    const active = data.activeSkinId === id && data.activeBgId === id;
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
    data.activeSkinId = id;
    data.activeBgId = id;
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
