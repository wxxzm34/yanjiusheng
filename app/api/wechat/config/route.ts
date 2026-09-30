import { templateId } from "@/lib/wechat/config";
import { json } from "@/lib/wechat/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const id = templateId();
  return json({ ok: true, templateId: id || null });
}
