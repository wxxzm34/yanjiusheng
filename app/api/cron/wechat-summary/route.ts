import { cronAuthorized, runSendJob } from "@/lib/wechat/job";
import { json } from "@/lib/wechat/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// 定时发送：POST 或 GET /api/cron/wechat-summary
// 请求头：Authorization: Bearer <WECHAT_CRON_SECRET>
// 还要有 WECHAT_APPSECRET、WECHAT_TEMPLATE_ID。说明见 README「微信汇总」。

async function handle(request: Request) {
  const auth = cronAuthorized(request);
  if (!auth.ok) return json({ ok: false, reason: auth.reason }, auth.status);
  const report = await runSendJob({ trigger: "http" });
  return json(report);
}

export function GET(request: Request) {
  return handle(request);
}

export function POST(request: Request) {
  return handle(request);
}
