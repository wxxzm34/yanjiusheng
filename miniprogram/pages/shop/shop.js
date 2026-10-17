const share = require("../../utils/share");
const { load, save } = require("../../utils/storage");
const { OUTFITS, getSkin, getBackground, paintChrome, DEFAULT_OUTFIT_ID } = require("../../utils/packs");

Page({
  data: {
    skin: getSkin(DEFAULT_OUTFIT_ID),
    bg: getBackground(DEFAULT_OUTFIT_ID),
    outfits: [],
    pendingId: "",
  },
  onShow() {
    share.enableShare();
    this.paint();
  },
  onShareAppMessage() {
    return share.onShareAppMessage();
  },
  onShareTimeline() {
    return share.onShareTimeline();
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
});
