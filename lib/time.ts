export function startOfDay(ts: number) {
  const date = new Date(ts);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatTime(ts: number) {
  const date = new Date(ts);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function weekdayName(ts: number) {
  return "日一二三四五六"[new Date(ts).getDay()];
}

export function formatFullDate(ts: number) {
  const date = new Date(ts);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 周${weekdayName(ts)}`;
}

export function formatMonth(year: number, month: number) {
  return `${year}年${month}月`;
}

export function formatDayLabel(ts: number, now = Date.now()) {
  const diff = Math.round((startOfDay(now) - startOfDay(ts)) / 86_400_000);
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  const date = new Date(ts);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}

export function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export function greeting(now = new Date()) {
  const hour = now.getHours();
  if (hour < 5) return "夜深了，醒着就轻轻记一笔";
  if (hour < 11) return "早上好，小本本翻开了";
  if (hour < 14) return "中午好，想记就记";
  if (hour < 18) return "下午好，日子过到这儿了";
  return "晚上好，今天的形状快齐了";
}

export function currentPeriod(now = new Date()) {
  return { year: now.getFullYear(), month: now.getMonth() + 1 };
}
