import crypto from "crypto";
import {
  appSecret,
  cronSecret,
  fieldDrinks,
  fieldPeriod,
  fieldSmokes,
  miniProgramState,
  sendBlocker,
  templateId,
  wechatAppId,
} from "@/lib/wechat/config";
import {
  PERIOD_LABEL,
  countsFor,
  duePeriods,
  periodStamp,
  sanitizeEntries,
  sanitizePrefs,
  shanghaiParts,
  type Period,
  type ShanghaiParts,
} from "@/lib/wechat/summary";
import { ensureUser, publicState, withStore, type UserRecord } from "@/lib/wechat/store";
import { weixinJson } from "@/lib/wechat/weixin";

export type JobReport = {
  ok: true;
  sent: number;
  skipped: number;
  users: number;
  reason: string;
};

export type Outbound = {
  openid: string;
  period: Period;
  label: string;
  smokes: number;
  drinks: number;
};

export type SendResult = { ok: true } | { ok: false; dropQuota?: boolean; reason: string };

type PlannedItem = Outbound & { stamp: string };

const logged = new Set<string>();

function logReason(trigger: "http" | "embedded", reason: string) {
  const line = `[wechat-summary] ${reason}`;
  if (trigger === "http") {
    console.warn(line);
    return;
  }
  if (logged.has(reason)) return;
  logged.add(reason);
  console.warn(line);
}

function tag(openid: string) {
  return openid.slice(-4);
}

function numberText(value: number) {
  return String(Math.max(0, Math.min(999_999, Math.floor(value))));
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

async function requestToken() {
  const url =
    "https://api.weixin.qq.com/cgi-bin/token" +
    `?grant_type=client_credential&appid=${encodeURIComponent(wechatAppId())}` +
    `&secret=${encodeURIComponent(appSecret())}`;
  const data = await weixinJson(url);
  const token = typeof data.access_token === "string" ? data.access_token : "";
  const expiresIn = typeof data.expires_in === "number" ? data.expires_in : 7200;
  if (!token) {
    const errcode = typeof data.errcode === "number" ? data.errcode : "";
    const errmsg = typeof data.errmsg === "string" ? data.errmsg : "";
    return { ok: false as const, reason: `微信 access_token 失败 ${errcode} ${errmsg}`.trim() };
  }
  return { ok: true as const, token, expiresAt: Date.now() + expiresIn * 1000 };
}

async function postSubscribe(token: string, message: Outbound): Promise<SendResult> {
  const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${encodeURIComponent(token)}`;
  const data: Record<string, { value: string }> = {
    [fieldPeriod()]: { value: message.label },
    [fieldSmokes()]: { value: numberText(message.smokes) },
    [fieldDrinks()]: { value: numberText(message.drinks) },
  };
  const result = await weixinJson(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      touser: message.openid,
      template_id: templateId(),
      page: "pages/home/home",
      miniprogram_state: miniProgramState(),
      lang: "zh_CN",
      data,
    }),
  });
  const errcode = typeof result.errcode === "number" ? result.errcode : -1;
  const errmsg = typeof result.errmsg === "string" ? result.errmsg : "";
  if (errcode === 0) return { ok: true };
  if (errcode === 43101) return { ok: false, dropQuota: true, reason: "微信拒绝（43101），允许次数已用完" };
  return { ok: false, reason: `微信发送失败 ${errcode} ${errmsg}`.trim() };
}

function realSender() {
  let token = "";
  let expiresAt = 0;
  return async (message: Outbound): Promise<SendResult> => {
    try {
      if (!token || expiresAt < Date.now() + 60_000) {
        const fresh = await loadToken(false);
        if (!fresh.ok) return fresh;
        token = fresh.token;
        expiresAt = fresh.expiresAt;
      }
      let result = await postSubscribe(token, message);
      if (!result.ok && /40001|40014|42001/.test(result.reason)) {
        const fresh = await loadToken(true);
        if (!fresh.ok) return fresh;
        token = fresh.token;
        expiresAt = fresh.expiresAt;
        result = await postSubscribe(token, message);
      }
      return result;
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      return { ok: false, reason: `微信发送请求失败：${messageText}` };
    }
  };
}

async function loadToken(force: boolean) {
  if (!force) {
    const cached = await withStore((store) => {
      if (store.accessToken && store.accessToken.expiresAt > Date.now() + 60_000) return store.accessToken;
      return null;
    });
    if (cached) return { ok: true as const, token: cached.token, expiresAt: cached.expiresAt };
  }
  const fresh = await requestToken();
  if (!fresh.ok) return fresh;
  await withStore((store) => {
    store.accessToken = { token: fresh.token, expiresAt: fresh.expiresAt };
  });
  return fresh;
}

function planUser(user: UserRecord, openid: string, now: ShanghaiParts) {
  const due = duePeriods(user.prefs, now);
  if (user.inflightAt && Date.now() - user.inflightAt < 60_000) {
    return { items: [] as PlannedItem[], skipped: 0, held: due.some((period) => user.sent[period] !== periodStamp(period, now)) };
  }
  const counts = countsFor(user.entries, now);
  const items: PlannedItem[] = [];
  let skipped = 0;
  let remaining = user.quota;
  for (const period of due) {
    const stamp = periodStamp(period, now);
    if (user.sent[period] === stamp) continue;
    if (remaining <= 0) {
      skipped += 1;
      console.warn(`[wechat-summary] 跳过${PERIOD_LABEL[period]}：没有剩余允许次数（…${tag(openid)}）`);
      continue;
    }
    remaining -= 1;
    items.push({
      openid,
      period,
      label: PERIOD_LABEL[period],
      smokes: counts[period].smokes,
      drinks: counts[period].drinks,
      stamp,
    });
  }
  if (items.length > 0) user.inflightAt = Date.now();
  return { items, skipped, held: false };
}

export async function runSendJob(
  input: { now?: Date; trigger?: "http" | "embedded"; send?: (message: Outbound) => Promise<SendResult> } = {},
): Promise<JobReport> {
  const trigger = input.trigger ?? "http";
  const blocker = sendBlocker();
  if (blocker) {
    logReason(trigger, blocker);
    return { ok: true, sent: 0, skipped: 0, users: 0, reason: blocker };
  }
  const nowParts = shanghaiParts(input.now ?? new Date());
  if (!nowParts) return { ok: true, sent: 0, skipped: 0, users: 0, reason: "现在的时间读不出来" };

  const planned = await withStore((store) => {
    const ids = Object.keys(store.users).sort();
    const batch: { openid: string; items: PlannedItem[] }[] = [];
    let skipped = 0;
    let held = false;
    for (const openid of ids) {
      const next = planUser(store.users[openid], openid, nowParts);
      skipped += next.skipped;
      held = held || next.held;
      if (next.items.length > 0) batch.push({ openid, items: next.items });
    }
    return { users: ids.length, batch, skipped, held };
  });

  if (planned.batch.length === 0) {
    const reason = planned.skipped > 0
      ? "有汇总到点了，但是没有剩余允许次数"
      : planned.held
        ? "正在发送，这次没有重复发"
        : "现在没有要发的汇总";
    return { ok: true, sent: 0, skipped: planned.skipped, users: planned.users, reason };
  }

  const send = input.send ?? realSender();
  let sent = 0;
  let skipped = planned.skipped;
  let reason = "";

  for (const group of planned.batch) {
    let dropped = false;
    try {
      for (const item of group.items) {
        if (dropped) {
          skipped += 1;
          continue;
        }
        let result: SendResult;
        try {
          result = await send(item);
        } catch (error) {
          const messageText = error instanceof Error ? error.message : String(error);
          result = { ok: false, reason: `发送出错：${messageText}` };
        }
        await withStore((store) => {
          const user = store.users[group.openid];
          if (!user) return;
          if (result.ok) {
            user.quota = Math.max(0, user.quota - 1);
            user.sent[item.period] = item.stamp;
            return;
          }
          if (result.dropQuota) user.quota = 0;
        });
        if (result.ok) {
          sent += 1;
          console.info(`[wechat-summary] 已发送${item.label} 烟${item.smokes} 酒${item.drinks}（…${tag(item.openid)}）`);
          continue;
        }
        skipped += 1;
        reason = result.reason;
        console.warn(`[wechat-summary] ${item.label}未发出：${result.reason}（…${tag(item.openid)}）`);
        if (result.dropQuota) dropped = true;
      }
    } finally {
      await withStore((store) => {
        const user = store.users[group.openid];
        if (user) delete user.inflightAt;
      });
    }
  }

  return {
    ok: true,
    sent,
    skipped,
    users: planned.users,
    reason: sent > 0 ? "" : reason || "没有发送",
  };
}

export function cronAuthorized(request: Request) {
  const expected = cronSecret();
  if (!expected) {
    console.warn("[wechat-summary] 拒绝定时任务：缺少 WECHAT_CRON_SECRET");
    return { ok: false as const, status: 503, reason: "缺少 WECHAT_CRON_SECRET" };
  }
  const header = request.headers.get("authorization") ?? "";
  const bearer = /^Bearer\s+(\S+)$/i.exec(header)?.[1] ?? "";
  const alt = request.headers.get("x-cron-secret")?.trim() ?? "";
  const given = bearer || alt;
  if (!given || !safeEqual(given, expected)) {
    return { ok: false as const, status: 401, reason: "密钥不对" };
  }
  return { ok: true as const };
}

export function startEmbeddedCron() {
  if (process.env.NEXT_PHASE === "phase-production-build") return;
  const holder = globalThis as typeof globalThis & { __yanjiushengWechatCron?: boolean };
  if (holder.__yanjiushengWechatCron) return;
  holder.__yanjiushengWechatCron = true;
  const tick = () => {
    void runSendJob({ trigger: "embedded" }).catch((error: unknown) => {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`[wechat-summary] 定时检查失败：${message}`);
    });
  };
  unrefTimer(setTimeout(tick, 15_000));
  unrefTimer(setInterval(tick, 60_000));
}

function unrefTimer(timer: unknown) {
  if (timer && typeof timer === "object" && "unref" in timer && typeof timer.unref === "function") {
    timer.unref();
  }
}

export async function applySync(openid: string, body: unknown) {
  const raw = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return withStore((store) => {
    const user = ensureUser(store, openid);
    if ("entries" in raw) user.entries = sanitizeEntries(raw.entries);
    if ("prefs" in raw) user.prefs = sanitizePrefs(raw.prefs, user.prefs);
    if (raw.accepted === 1) user.quota = Math.min(50, user.quota + 1);
    user.updatedAt = Date.now();
    return publicState(user);
  });
}

export async function readState(openid: string) {
  return withStore((store) => publicState(store.users[openid]));
}
