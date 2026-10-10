import fs from "fs";
import os from "os";
import path from "path";
import assert from "node:assert/strict";
import { OFFICIAL_APPID } from "@/lib/wechat/config";
import { applySync, buildSubscribeData, runSendJob, type Outbound } from "@/lib/wechat/job";
import { clampDay, countsFor, isDue, shanghaiParts, type Prefs } from "@/lib/wechat/summary";

const dir = fs.mkdtempSync(path.join(os.tmpdir(), "yanjiu-"));
process.env.WECHAT_DATA_FILE = path.join(dir, "users.json");
process.env.WECHAT_APPID = OFFICIAL_APPID;
process.env.WECHAT_APPSECRET = "";
process.env.WECHAT_TEMPLATE_ID = "";
delete process.env.WECHAT_FIELD_ML;

async function main() {
const evening = new Date("2026-10-09T13:05:00.000Z");
const parts = shanghaiParts(evening);
assert.ok(parts);
assert.equal(parts.hour, 21);
assert.equal(parts.minute, 5);
assert.equal(parts.day, 9);

const blocked = await runSendJob({
  now: evening,
  trigger: "http",
  send: async () => {
    throw new Error("没有密钥时不应该发送");
  },
});
assert.equal(blocked.sent, 0);
assert.match(blocked.reason, /WECHAT_APPSECRET/);

process.env.WECHAT_APPSECRET = "test-secret";
process.env.WECHAT_TEMPLATE_ID = "tmpl-test";

const sameDay = new Date("2026-10-09T12:00:00.000Z").getTime();
const yesterday = new Date("2026-10-08T12:00:00.000Z").getTime();
const counted = countsFor(
  [
    { kind: "smoke", at: sameDay, count: 3 },
    { kind: "drink", at: sameDay, count: 2, drinkType: "啤酒" },
    { kind: "drink", at: sameDay, count: 80, drinkType: "白酒", unit: "ml" },
    { kind: "drink", at: sameDay, count: 1, drinkType: "白酒", unit: "cup" },
    { kind: "smoke", at: yesterday, count: 4 },
  ],
  parts,
);
assert.deepEqual(counted.daily, { smokes: 3, drinks: 3, baijiuMl: 80 });
assert.equal(counted.monthly.smokes, 7);
assert.equal(counted.monthly.baijiuMl, 80);

const prefs: Prefs = {
  daily: true,
  monthly: false,
  yearly: false,
  hour: 21,
  minute: 0,
  monthDay: 31,
  yearMonth: 12,
  yearDay: 31,
};
await applySync("openid-daily", {
  entries: [
    { kind: "smoke", at: sameDay, count: 3 },
    { kind: "drink", at: sameDay, count: 2, drinkType: "啤酒" },
    { kind: "drink", at: sameDay, count: 80, drinkType: "白酒", unit: "ml" },
    { kind: "drink", at: sameDay, count: 1, drinkType: "白酒", unit: "cup" },
  ],
  prefs,
  accepted: 1,
});

const sent: Outbound[] = [];
const first = await runSendJob({
  now: evening,
  trigger: "http",
  send: async (message) => {
    sent.push(message);
    return { ok: true };
  },
});
assert.equal(first.sent, 1);
assert.equal(sent.length, 1);
assert.equal(sent[0].label, "一天小结");
assert.equal(sent[0].smokes, 3);
assert.equal(sent[0].drinks, 3);
assert.equal(sent[0].baijiuMl, 80);

const data = buildSubscribeData(sent[0]);
assert.equal(data.ok, true);
if (data.ok) {
  assert.equal(data.data.thing1.value, "一天小结");
  assert.equal(data.data.number2.value, "3");
  assert.equal(data.data.number3.value, "3");
  assert.equal(data.data.number4.value, "80");
}

const second = await runSendJob({
  now: evening,
  trigger: "http",
  send: async () => {
    throw new Error("同一天不应该再发");
  },
});
assert.equal(second.sent, 0);

const monthEnd = shanghaiParts(new Date("2026-02-28T13:00:00.000Z"));
assert.ok(monthEnd);
assert.equal(clampDay(2026, 2, 31), 28);
assert.equal(isDue({ ...prefs, daily: false, monthly: true, monthDay: 31 }, "monthly", monthEnd), true);

process.env.WECHAT_FIELD_ML = "number3";
const clash = buildSubscribeData(sent[0]);
assert.equal(clash.ok, false);

console.log("wechat summary checks passed");
}

main();
