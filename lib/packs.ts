export type HeroPose = "star" | "leaf" | "moon";

export type Skin = {
  id: string;
  name: string;
  blurb: string;
  free: boolean;
  pose: HeroPose;
  accent: string;
  accentSoft: string;
  ink: string;
  paper: string;
  onAccent: string;
  heroBody: string;
  heroTrim: string;
  heroEmblem: string;
  cape: string;
  laser: string;
  laserCore: string;
};

export type BackgroundMotif = "lamp" | "balcony" | "rain" | "sakura";

export type BackgroundPack = {
  id: string;
  name: string;
  blurb: string;
  free: boolean;
  motif: BackgroundMotif;
  from: string;
  to: string;
};

export const SKINS: Skin[] = [
  {
    id: "skin-star",
    name: "星焰",
    blurb: "额头贴着一颗星，披肩像小毯子，激光是糖色的。",
    free: true,
    pose: "star",
    accent: "#ff5a36",
    accentSoft: "#ffe8dc",
    ink: "#2b2118",
    paper: "#fff8f1",
    onAccent: "#fffaf6",
    heroBody: "#ff5a36",
    heroTrim: "#fff3e4",
    heroEmblem: "#ffd60a",
    cape: "#ff8c42",
    laser: "#ff3b1f",
    laserCore: "#ffe66d",
  },
  {
    id: "skin-mint",
    name: "薄荷汽球",
    blurb: "绿色头盔，叶子徽章，跳起来才发射。",
    free: false,
    pose: "leaf",
    accent: "#1fa97a",
    accentSoft: "#d8f6ea",
    ink: "#14352c",
    paper: "#f3fff9",
    onAccent: "#f4fff9",
    heroBody: "#1fa97a",
    heroTrim: "#f4fff9",
    heroEmblem: "#b8f2d6",
    cape: "#148f68",
    laser: "#3dd6a5",
    laserCore: "#e7fff6",
  },
  {
    id: "skin-moon",
    name: "月灯",
    blurb: "蹲得低低的，月亮徽章，光束偏紫。",
    free: false,
    pose: "moon",
    accent: "#6c4ce2",
    accentSoft: "#ebe3ff",
    ink: "#241847",
    paper: "#f7f3ff",
    onAccent: "#f6f1ff",
    heroBody: "#4c3299",
    heroTrim: "#f6f1ff",
    heroEmblem: "#f4c95d",
    cape: "#7c5cbf",
    laser: "#b388ff",
    laserCore: "#fff3c4",
  },
];

export const BACKGROUNDS: BackgroundPack[] = [
  {
    id: "bg-lamp",
    name: "台灯角落",
    blurb: "暖暖的墙，一盏不肯睡的灯。",
    free: true,
    motif: "lamp",
    from: "#ffd7a8",
    to: "#fff1dc",
  },
  {
    id: "bg-balcony",
    name: "晒被子的阳台",
    blurb: "有太阳、栏杆，还有一条花被子。",
    free: true,
    motif: "balcony",
    from: "#8fd3ef",
    to: "#fff6d8",
  },
  {
    id: "bg-rain",
    name: "听雨窗台",
    blurb: "夜里下雨，窗子里还亮着一小块暖光。",
    free: false,
    motif: "rain",
    from: "#14213d",
    to: "#3d5a80",
  },
  {
    id: "bg-sakura",
    name: "樱花放学路",
    blurb: "粉路、圆树、掉下来的花瓣。",
    free: false,
    motif: "sakura",
    from: "#ffd0e0",
    to: "#fff7fb",
  },
];

export const DEFAULT_SKIN_ID = "skin-star";
export const DEFAULT_BG_ID = "bg-lamp";

export function getSkin(id: string) {
  return SKINS.find((skin) => skin.id === id);
}

export function getBackground(id: string) {
  return BACKGROUNDS.find((background) => background.id === id);
}

export function skinVars(skin: Skin): Record<string, string> {
  return {
    "--primary": skin.accent,
    "--primary-foreground": skin.onAccent,
    "--ring": skin.accent,
    "--accent": skin.accentSoft,
    "--accent-foreground": skin.ink,
    "--foreground": skin.ink,
    "--skin-accent": skin.accent,
    "--skin-ink": skin.ink,
    "--skin-paper": skin.paper,
    "--skin-soft": skin.accentSoft,
  };
}
