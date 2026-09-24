const { load, save } = require("../../utils/storage");
const { paintChrome } = require("../../utils/packs");
const { groupByDay } = require("../../utils/stats");

Page({
  data: { groups: [] },
  onShow() {
    const data = load();
    paintChrome(data);
    this.setData({ groups: groupByDay(data.entries) });
  },
  edit(event) {
    wx.navigateTo({ url: `/pages/edit/edit?id=${event.currentTarget.dataset.id}` });
  },
  remove(event) {
    const id = event.currentTarget.dataset.id;
    wx.showModal({
      title: "删掉这条？",
      content: "删了就不算进支数和月报。",
      success: (res) => {
        if (!res.confirm) return;
        const data = load();
        data.entries = data.entries.filter((entry) => entry.id !== id);
        save(data);
        this.onShow();
      },
    });
  },
  clearAll() {
    wx.showModal({
      title: "清空全部记录？",
      content: "皮肤和背景还会留着。",
      success: (res) => {
        if (!res.confirm) return;
        const data = load();
        data.entries = [];
        save(data);
        this.onShow();
      },
    });
  },
});
