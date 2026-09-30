import { applySync, readState } from "@/lib/wechat/job";
import { json } from "@/lib/wechat/http";
import { openidFromRequest } from "@/lib/wechat/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function readBody(request: Request) {
  const length = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(length) && length > 2_000_000) {
    return { ok: false as const, response: json({ ok: false, reason: "内容太大" }, 413) };
  }
  try {
    return { ok: true as const, value: await request.json() };
  } catch {
    return { ok: false as const, response: json({ ok: false, reason: "内容不是 JSON" }, 400) };
  }
}

export async function GET(request: Request) {
  const openid = openidFromRequest(request);
  if (!openid) return json({ ok: false, reason: "还没登录微信" }, 401);
  const state = await readState(openid);
  return json({ ok: true, ...state });
}

export async function POST(request: Request) {
  const openid = openidFromRequest(request);
  if (!openid) return json({ ok: false, reason: "还没登录微信" }, 401);
  const body = await readBody(request);
  if (!body.ok) return body.response;
  const state = await applySync(openid, body.value);
  return json({ ok: true, ...state });
}
