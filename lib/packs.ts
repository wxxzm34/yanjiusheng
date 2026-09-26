export type OutfitMotif = "cool" | "happy" | "wild";

export type Outfit = {
  id: string;
  name: string;
  blurb: string;
  free: boolean;
  motif: OutfitMotif;
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
  from: string;
  to: string;
};

export type Skin = Outfit;
export type BackgroundPack = Outfit;

export const OUTFITS: Outfit[] = [
  {
    id: "outfit-cool",
    name: "冷酷风",
    blurb: "深色、利落，冷蓝和灰，少一点装饰。",
    free: false,
    motif: "cool",
    accent: "#8aa4bf",
    accentSoft: "#1a2633",
    ink: "#e7eef6",
    paper: "#121820",
    onAccent: "#0e141c",
    heroBody: "#9bb0c4",
    heroTrim: "#d7e1ec",
    heroEmblem: "#c5d4e4",
    cape: "#3e5166",
    laser: "#b7c9db",
    laserCore: "#f4f7fb",
    from: "#0e141c",
    to: "#243140",
  },
  {
    id: "outfit-happy",
    name: "快乐风格",
    blurb: "明亮、暖和，颜色软一点，记起来轻松。",
    free: true,
    motif: "happy",
    accent: "#ff5a36",
    accentSoft: "#ffe8dc",
    ink: "#2b2118",
    paper: "#fff8f1",
    onAccent: "#fffaf6",
    heroBody: "#ff7a45",
    heroTrim: "#fff3e4",
    heroEmblem: "#ffd60a",
    cape: "#ffb703",
    laser: "#ff3b1f",
    laserCore: "#ffe66d",
    from: "#ffd7a8",
    to: "#fff6e4",
  },
  {
    id: "outfit-wild",
    name: "癫狂时刻",
    blurb: "对比很强，霓虹乱跳，适合特别疯的一刻。",
    free: false,
    motif: "wild",
    accent: "#ff2bd6",
    accentSoft: "#2a1030",
    ink: "#fff6fb",
    paper: "#160814",
    onAccent: "#1a0614",
    heroBody: "#ff4d6d",
    heroTrim: "#ffe600",
    heroEmblem: "#39ff14",
    cape: "#7c3aed",
    laser: "#00f0ff",
    laserCore: "#ffffff",
    from: "#120014",
    to: "#3b0764",
  },
];

export const DEFAULT_OUTFIT_ID = "outfit-happy";
export const DEFAULT_SKIN_ID = DEFAULT_OUTFIT_ID;
export const DEFAULT_BG_ID = DEFAULT_OUTFIT_ID;

export function getOutfit(id: string) {
  return OUTFITS.find((outfit) => outfit.id === id);
}

export function getSkin(id: string) {
  return getOutfit(id);
}

export function getBackground(id: string) {
  return getOutfit(id);
}

export function skinVars(skin: Outfit): Record<string, string> {
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
