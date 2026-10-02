import fs from "fs";
import path from "path";

function env(name: string) {
  return process.env[name]?.trim() ?? "";
}

export function wechatAppId() {
  const fromEnv = env("WECHAT_APPID");
  if (fromEnv) return fromEnv;
  try {
    const file = path.join(process.cwd(), "miniprogram", "project.config.json");
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as { appid?: unknown };
    return typeof parsed.appid === "string" ? parsed.appid.trim() : "";
  } catch {
    return "";
  }
}

export function appSecret() {
  return env("WECHAT_APPSECRET");
}

export function templateId() {
  return env("WECHAT_TEMPLATE_ID");
}

export function cronSecret() {
  return env("WECHAT_CRON_SECRET");
}

function fieldName(value: string, fallback: string) {
  return /^[A-Za-z][A-Za-z0-9_]{0,30}$/.test(value) ? value : fallback;
}

export function fieldPeriod() {
  return fieldName(env("WECHAT_FIELD_PERIOD"), "thing1");
}

export function fieldSmokes() {
  return fieldName(env("WECHAT_FIELD_SMOKES"), "number2");
}

export function fieldDrinks() {
  return fieldName(env("WECHAT_FIELD_DRINKS"), "number3");
}

export function dataFile() {
  const custom = env("WECHAT_DATA_FILE");
  if (custom) {
    // 路径来自环境变量。忽略追踪，避免把整个仓库打进部署包。
    return path.resolve(/*turbopackIgnore: true*/ custom);
  }
  return path.join(process.cwd(), "data", "wechat-users.json");
}

export function miniProgramState() {
  const value = env("WECHAT_MINIPROGRAM_STATE");
  if (value === "developer" || value === "trial" || value === "formal") return value;
  return "formal";
}

export function sendBlocker() {
  const missing: string[] = [];
  if (!appSecret()) missing.push("WECHAT_APPSECRET");
  if (!templateId()) missing.push("WECHAT_TEMPLATE_ID");
  if (missing.length > 0) return `缺少 ${missing.join("、")}，没有发送`;
  const appid = wechatAppId();
  if (!appid || appid === "touristappid") {
    return "AppID 还不是正式的（当前是 touristappid 或为空），没有发送。请设置 WECHAT_APPID";
  }
  return null;
}
