const OUTFITS = [
  {
    id: "outfit-cool",
    name: "冷酷风",
    blurb: "深色、利落，冷蓝和灰，少一点装饰。",
    free: false,
    accent: "#8aa4bf",
    heroBody: "#9bb0c4",
    laser: "#b7c9db",
    ink: "#e7eef6",
    paper: "#121820",
    from: "#0e141c",
    to: "#243140",
  },
  {
    id: "outfit-happy",
    name: "快乐风格",
    blurb: "明亮、暖和，颜色软一点，记起来轻松。",
    free: true,
    accent: "#ff5a36",
    heroBody: "#ff7a45",
    laser: "#ff3b1f",
    ink: "#2b2118",
    paper: "#fff8f1",
    from: "#ffd7a8",
    to: "#fff6e4",
  },
  {
    id: "outfit-wild",
    name: "癫狂时刻",
    blurb: "对比很强，霓虹乱跳，适合特别疯的一刻。",
    free: false,
    accent: "#ff2bd6",
    heroBody: "#ff4d6d",
    laser: "#00f0ff",
    ink: "#fff6fb",
    paper: "#160814",
    from: "#120014",
    to: "#3b0764",
  },
];

const DEFAULT_OUTFIT_ID = "outfit-happy";

function getOutfit(id) {
  return OUTFITS.find((item) => item.id === id) || OUTFITS.find((item) => item.id === DEFAULT_OUTFIT_ID);
}

function getSkin(id) {
  return getOutfit(id);
}

function getBackground(id) {
  return getOutfit(id);
}

function paintChrome(data) {
  const skin = getSkin(data && data.activeSkinId);
  wx.setNavigationBarColor({
    frontColor: skin.id === "outfit-cool" ? "#000000" : "#ffffff",
    backgroundColor: skin.accent,
  });
}

module.exports = {
  OUTFITS,
  DEFAULT_OUTFIT_ID,
  getOutfit,
  getSkin,
  getBackground,
  paintChrome,
};
