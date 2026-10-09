const { load } = require("./storage");
const { filterToday, summarize } = require("./stats");

// 右上角「转发」「分享到朋友圈」只有页面定义了对应函数才会出现。
// 以前的「分享今天」只是复制文字，所以菜单里这两项是关着的。

function enableShare() {
  if (!wx.showShareMenu) return;
  wx.showShareMenu({
    withShareTicket: true,
    menus: ["shareAppMessage", "shareTimeline"],
    fail() {},
  });
}

function summaryTitle(label, summary) {
  const smokes = summary && summary.smokes ? summary.smokes : 0;
  const drinks = summary && summary.drinks ? summary.drinks : 0;
  const ml = summary && summary.baijiuMl ? summary.baijiuMl : 0;
  if (!smokes && !drinks && !ml) return `${label}还没记烟和酒`;
  const parts = [`${label}：烟 ${smokes} 支`, `酒 ${drinks} 杯`];
  if (ml > 0) parts.push(`白酒 ${ml} 毫升`);
  return parts.join("，");
}

function card(title, path, query) {
  return {
    title,
    path: path || "/pages/home/home",
    query: query || "from=share",
  };
}

function todayCard() {
  const now = new Date();
  const summary = summarize(filterToday(load().entries, now.getTime()));
  const label = `今天${now.getMonth() + 1}月${now.getDate()}日`;
  return card(summaryTitle(label, summary), "/pages/home/home", "from=share");
}

function onShareAppMessage() {
  const item = todayCard();
  return { title: item.title, path: item.path };
}

function onShareTimeline() {
  const item = todayCard();
  return { title: item.title, query: item.query };
}

module.exports = {
  enableShare,
  summaryTitle,
  card,
  todayCard,
  onShareAppMessage,
  onShareTimeline,
};
