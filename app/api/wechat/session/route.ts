import { json } from "@/lib/wechat/http";
import { loginWithCode } from "@/lib/wechat/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, reason: "内容不是 JSON" }, 400);
  }
  const code = body && typeof body === "object" && "code" in body && typeof body.code === "string" ? body.code : "";
  const result = await loginWithCode(code);
  if (!result.ok) return json({ ok: false, reason: result.reason }, result.status);
  return json({ ok: true, token: result.token, exp: result.exp });
}
