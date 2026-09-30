import crypto from "crypto";
import { appSecret, wechatAppId } from "@/lib/wechat/config";
import { isOpenId } from "@/lib/wechat/store";
import { weixinJson } from "@/lib/wechat/weixin";

const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

function sign(body: string) {
  return crypto.createHmac("sha256", appSecret()).update(body).digest("base64url");
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export function signSession(openid: string, now = Date.now()) {
  const exp = now + SESSION_MS;
  const body = Buffer.from(JSON.stringify({ openid, exp })).toString("base64url");
  return { token: `${body}.${sign(body)}`, exp };
}

export function verifySession(token: string) {
  if (!appSecret()) return null;
  const dot = token.indexOf(".");
  if (dot <= 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!safeEqual(sig, sign(body))) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as {
      openid?: unknown;
      exp?: unknown;
    };
    if (typeof payload.openid !== "string" || !isOpenId(payload.openid)) return null;
    if (typeof payload.exp !== "number" || payload.exp < Date.now()) return null;
    return payload.openid;
  } catch {
    return null;
  }
}

export function openidFromRequest(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  const match = /^Bearer\s+(\S+)$/i.exec(header);
  if (!match) return null;
  return verifySession(match[1]);
}

export async function loginWithCode(code: string) {
  if (!/^[\w-]{8,128}$/.test(code)) {
    return { ok: false as const, status: 400, reason: "登录码不对" };
  }
  if (!appSecret()) {
    console.warn("[wechat-summary] 无法识别微信用户：缺少 WECHAT_APPSECRET");
    return { ok: false as const, status: 503, reason: "缺少 WECHAT_APPSECRET" };
  }
  const appid = wechatAppId();
  if (!appid || appid === "touristappid") {
    console.warn("[wechat-summary] 无法识别微信用户：请设置 WECHAT_APPID（project.config.json 里现在是 touristappid）");
    return { ok: false as const, status: 503, reason: "缺少可用的 WECHAT_APPID" };
  }
  const url =
    "https://api.weixin.qq.com/sns/jscode2session" +
    `?appid=${encodeURIComponent(appid)}` +
    `&secret=${encodeURIComponent(appSecret())}` +
    `&js_code=${encodeURIComponent(code)}` +
    "&grant_type=authorization_code";
  try {
    const data = await weixinJson(url);
    const openid = typeof data.openid === "string" ? data.openid : "";
    if (!isOpenId(openid)) {
      const errcode = typeof data.errcode === "number" ? data.errcode : "";
      const errmsg = typeof data.errmsg === "string" ? data.errmsg : "";
      console.warn(`[wechat-summary] 微信登录失败 ${errcode} ${errmsg}`.trim());
      return { ok: false as const, status: 502, reason: "微信登录失败" };
    }
    const session = signSession(openid);
    return { ok: true as const, token: session.token, exp: session.exp };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.warn(`[wechat-summary] 微信登录请求失败：${message}`);
    return { ok: false as const, status: 502, reason: "微信登录请求失败" };
  }
}
