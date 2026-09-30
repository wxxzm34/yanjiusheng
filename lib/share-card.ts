import type { BackgroundPack, Skin } from "@/lib/packs";
import { drinkParts, formatDrinkPart, moodParts, type Summary } from "@/lib/stats";
import { MOODS, MOOD_COLORS, UNSET_MOOD_COLOR } from "@/lib/types";

export type CardModel = {
  title: string;
  summary: Summary;
  skin: Skin;
  background: BackgroundPack;
};

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
) {
  let line = "";
  let cursor = y;
  for (const char of text) {
    const next = line + char;
    if (line && ctx.measureText(next).width > maxWidth) {
      ctx.fillText(line, x, cursor);
      line = char;
      cursor += lineHeight;
    } else {
      line = next;
    }
  }
  if (line) ctx.fillText(line, x, cursor);
  return cursor;
}

export function drawShareCard(
  ctx: CanvasRenderingContext2D,
  model: CardModel,
  width: number,
  height: number,
  displayFont: string,
  bodyFont: string,
) {
  const { skin, background, summary, title } = model;
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, background.from);
  gradient.addColorStop(1, background.to);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = skin.heroEmblem;
  ctx.globalAlpha = 0.35;
  ctx.beginPath();
  ctx.arc(80, 90, 70, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width - 70, 160, 90, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;

  roundRect(ctx, 48, 180, width - 96, 620, 36);
  ctx.fillStyle = skin.paper;
  ctx.fill();

  ctx.fillStyle = skin.ink;
  ctx.font = `400 54px ${displayFont}`;
  ctx.textBaseline = "top";
  ctx.fillText("烟酒生", 84, 214);

  ctx.font = `400 28px ${bodyFont}`;
  ctx.fillStyle = skin.accent;
  wrapText(ctx, title, 84, 282, width - 180, 36);

  ctx.font = `700 72px ${displayFont}`;
  ctx.fillStyle = skin.ink;
  const smokeLabel = String(summary.smokes);
  ctx.fillText(smokeLabel, 84, 360);
  const smokeWidth = ctx.measureText(smokeLabel).width;
  ctx.font = `400 28px ${bodyFont}`;
  ctx.fillText("支烟", 84 + smokeWidth + 16, 400);

  const drinkX = width / 2 + 10;
  ctx.font = `700 72px ${displayFont}`;
  ctx.fillStyle = skin.accent;
  const drinkLabel = String(summary.drinks);
  ctx.fillText(drinkLabel, drinkX, 360);
  const drinkWidth = ctx.measureText(drinkLabel).width;
  ctx.font = `400 28px ${bodyFont}`;
  ctx.fillStyle = skin.ink;
  ctx.fillText("杯酒", drinkX + drinkWidth + 16, 400);

  ctx.font = `400 26px ${bodyFont}`;
  const drinkBits = drinkParts(summary).map((item) => formatDrinkPart(item));
  if (summary.baijiuMl > 0 && !drinkBits.some((bit) => bit.includes("毫升"))) {
    drinkBits.push(`用量 ${summary.baijiuMl} 毫升`);
  }
  const drinkLine = drinkBits.join("  ·  ");
  const moodLine = moodParts(summary).join("  ·  ");
  ctx.fillStyle = skin.ink;
  wrapText(ctx, drinkLine || "没有酒", 84, 500, width - 180, 36);
  wrapText(ctx, moodLine || "心情还没选", 84, 548, width - 180, 36);
  paintMoodBar(ctx, summary, 84, 600, width - 180);
  ctx.fillStyle = skin.accent;
  ctx.fillText("轻轻记下，不打分。", 84, 700);

  paintHero(ctx, skin, 96, 840);
  paintUser(ctx, 520, 860);
}

function paintMoodBar(
  ctx: CanvasRenderingContext2D,
  summary: Summary,
  x: number,
  y: number,
  width: number,
) {
  const items = [
    ...MOODS.map((mood) => ({ color: MOOD_COLORS[mood], count: summary.moods[mood] })),
    { color: UNSET_MOOD_COLOR, count: summary.unset },
  ].filter((item) => item.count > 0);
  const total = items.reduce((sum, item) => sum + item.count, 0);
  if (!total) return;
  let offset = 0;
  items.forEach((item, index) => {
    const slice = index === items.length - 1 ? width - offset : Math.max(10, Math.round((item.count / total) * width));
    ctx.fillStyle = item.color;
    ctx.fillRect(x + offset, y, slice, 16);
    offset += slice;
  });
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function paintHero(ctx: CanvasRenderingContext2D, skin: Skin, x: number, y: number) {
  ctx.fillStyle = skin.cape;
  ctx.beginPath();
  ctx.moveTo(x + 20, y + 40);
  ctx.lineTo(x - 10, y + 110);
  ctx.lineTo(x + 36, y + 90);
  ctx.fill();
  ctx.fillStyle = skin.heroBody;
  roundRect(ctx, x + 18, y + 48, 52, 40, 14);
  ctx.fill();
  ctx.fillStyle = skin.heroTrim;
  ctx.beginPath();
  ctx.arc(x + 44, y + 36, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.heroBody;
  ctx.beginPath();
  ctx.arc(x + 44, y + 24, 22, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = skin.heroEmblem;
  ctx.beginPath();
  ctx.arc(x + 44, y + 18, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = skin.ink;
  ctx.beginPath();
  ctx.arc(x + 34, y + 36, 2.4, 0, Math.PI * 2);
  ctx.arc(x + 54, y + 36, 2.4, 0, Math.PI * 2);
  ctx.fill();
}

function paintUser(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.fillStyle = "#ef8354";
  roundRect(ctx, x, y + 46, 58, 42, 16);
  ctx.fill();
  ctx.fillStyle = "#ffd8be";
  ctx.beginPath();
  ctx.arc(x + 28, y + 34, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#3d2c29";
  ctx.beginPath();
  ctx.arc(x + 28, y + 18, 16, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = "#2b2118";
  ctx.beginPath();
  ctx.arc(x + 18, y + 34, 2.2, 0, Math.PI * 2);
  ctx.arc(x + 36, y + 34, 2.2, 0, Math.PI * 2);
  ctx.fill();
}

export async function renderShareCard(model: CardModel) {
  await Promise.race([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((resolve) => window.setTimeout(resolve, 1200)),
  ]);
  const width = 750;
  const height = 1000;
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.scale(scale, scale);
  const rootStyle = getComputedStyle(document.documentElement);
  const display = rootStyle.getPropertyValue("--font-display-family").trim() || "ZCOOL KuaiLe";
  const body = rootStyle.getPropertyValue("--font-body").trim() || "Noto Sans SC";
  const stack = `"PingFang SC", "Noto Sans SC", "Noto Sans CJK SC", "Microsoft YaHei", sans-serif`;
  drawShareCard(ctx, model, width, height, `${display}, ${stack}`, `${body}, ${stack}`);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("blob");
  return blob;
}
