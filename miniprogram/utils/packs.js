const SKINS = [
  {
    id: "skin-star",
    name: "星焰",
    blurb: "额头贴着一颗星，披肩像小毯子，激光是糖色的。",
    free: true,
    accent: "#ff5a36",
    heroBody: "#ff5a36",
    laser: "#ff3b1f",
  },
  {
    id: "skin-mint",
    name: "薄荷汽球",
    blurb: "绿色头盔，叶子徽章，跳起来才发射。",
    free: false,
    accent: "#1fa97a",
    heroBody: "#1fa97a",
    laser: "#3dd6a5",
  },
  {
    id: "skin-moon",
    name: "月灯",
    blurb: "蹲得低低的，月亮徽章，光束偏紫。",
    free: false,
    accent: "#6c4ce2",
    heroBody: "#4c3299",
    laser: "#b388ff",
  },
];

const BACKGROUNDS = [
  { id: "bg-lamp", name: "台灯角落", blurb: "暖暖的墙，一盏不肯睡的灯。", free: true, from: "#ffd7a8" },
  { id: "bg-balcony", name: "晒被子的阳台", blurb: "有太阳、栏杆，还有一条花被子。", free: true, from: "#8fd3ef" },
  { id: "bg-rain", name: "听雨窗台", blurb: "夜里下雨，窗子里还亮着一小块暖光。", free: false, from: "#14213d" },
  { id: "bg-sakura", name: "樱花放学路", blurb: "粉路、圆树、掉下来的花瓣。", free: false, from: "#ffd0e0" },
];

function getSkin(id) {
  return SKINS.find((item) => item.id === id) || SKINS[0];
}

function getBackground(id) {
  return BACKGROUNDS.find((item) => item.id === id) || BACKGROUNDS[0];
}

function paintChrome(data) {
  const skin = getSkin(data.activeSkinId);
  wx.setNavigationBarColor({
    frontColor: "#ffffff",
    backgroundColor: skin.accent,
  });
}

module.exports = { SKINS, BACKGROUNDS, getSkin, getBackground, paintChrome };
