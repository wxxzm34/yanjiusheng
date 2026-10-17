// 暂时不挂进 app.json，首页也没有入口。订阅推送先不出现在界面上。
// 以后加回时：把 pages/summary/summary 写回 app.json，并在首页放回按钮。
// 一天小结、每月报告、每年报告应各自选时间，不要共用一个时刻。
const share = require("../../utils/share");
const { loadPrefs, writePrefs } = require("../../utils/subscribe");
const { cachedTemplateId, fetchState, fetchTemplateId, hasServer, postSync } = require("../../utils/sync");

function pad(value) {
  return String(value).padStart(2, "0");
}

function dayLabels() {
  const list = [];
  for (let day = 1; day <= 31; day += 1) list.push(`${day}日`);
  return list;
}

function monthLabels() {
  const list = [];
  for (let month = 1; month <= 12; month += 1) list.push(`${month}月`);
  return list;
}

function plainReason(reason) {
  const text = reason ? String(reason) : "";
  if (!text) return "服务器还没连上。开关先记在这台手机里。";
  if (text.indexOf("APPSECRET") >= 0) return "服务器还没填小程序密钥。开关先记在这台手机里。";
  if (text.indexOf("APPID") >= 0) return "服务器还没填小程序 AppID。开关先记在这台手机里。";
  if (text.indexOf("TEMPLATE") >= 0) return "模板编号还没配。开关先记在这台手机里。";
  if (text.indexOf("服务器地址") >= 0) return "还没填服务器地址。开关只保存在这台手机里。";
  return text;
}

Page({
  data: {
    daily: false,
    monthly: false,
    yearly: false,
    timeValue: "21:00",
    monthDay: 31,
    yearMonth: 12,
    yearDay: 31,
    dayLabels: dayLabels(),
    monthLabels: monthLabels(),
    templateId: "",
    status: "",
  },
  onShow() {
    share.enableShare();
    this.gone = false;
    this.localEdits = false;
    this.applyPrefs(loadPrefs());
    this.setData({ templateId: cachedTemplateId() });
    this.loadRemote();
  },
  onShareAppMessage() {
    return share.onShareAppMessage();
  },
  onShareTimeline() {
    return share.onShareTimeline();
  },
  onUnload() {
    this.gone = true;
  },
  applyPrefs(prefs) {
    this.setData({
      daily: prefs.daily,
      monthly: prefs.monthly,
      yearly: prefs.yearly,
      timeValue: `${pad(prefs.hour)}:${pad(prefs.minute)}`,
      monthDay: prefs.monthDay,
      yearMonth: prefs.yearMonth,
      yearDay: prefs.yearDay,
    });
  },
  currentPrefs() {
    const match = /^(\d{2}):(\d{2})$/.exec(this.data.timeValue || "");
    return {
      daily: Boolean(this.data.daily),
      monthly: Boolean(this.data.monthly),
      yearly: Boolean(this.data.yearly),
      hour: match ? Number(match[1]) : 21,
      minute: match ? Number(match[2]) : 0,
      monthDay: this.data.monthDay,
      yearMonth: this.data.yearMonth,
      yearDay: this.data.yearDay,
    };
  },
  setStatus(status) {
    if (this.gone) return;
    this.setData({ status });
  },
  statusText(quota) {
    let text = `还能发 ${quota || 0} 条。`;
    if (!this.data.templateId && !cachedTemplateId()) text += "模板还没配，暂时发不了，开关会先记下。";
    return text;
  },
  async loadRemote() {
    let templateId = "";
    try {
      templateId = await fetchTemplateId();
    } catch (error) {
      templateId = cachedTemplateId();
    }
    if (this.gone) return;
    if (templateId) this.setData({ templateId });
    if (!hasServer()) {
      this.setStatus("还没填服务器地址。开关只保存在这台手机里。");
      return;
    }
    try {
      const state = await fetchState();
      if (this.gone || this.localEdits) return;
      if (!state || !state.ok) {
        this.setStatus(plainReason(state && state.reason));
        return;
      }
      const local = loadPrefs();
      if (!local.updatedAt && state.updatedAt && state.prefs) {
        writePrefs(state.prefs, state.updatedAt);
        this.applyPrefs(state.prefs);
        this.setStatus(this.statusText(state.quota));
        return;
      }
      this.setStatus(this.statusText(state.quota));
      if (local.updatedAt) this.enqueue(this.currentPrefs(), 0);
    } catch (error) {
      if (this.gone) return;
      this.setStatus(plainReason(error && error.message));
    }
  },
  enqueue(prefs, accepted) {
    writePrefs(prefs, Date.now());
    const run = () => this.push(prefs, accepted === 1 ? 1 : 0);
    this.tail = Promise.resolve(this.tail).then(run, run);
  },
  push(prefs, accepted) {
    if (!hasServer()) {
      this.setStatus("还没填服务器地址。开关只保存在这台手机里。");
      return Promise.resolve();
    }
    return postSync({ prefs, accepted })
      .then((body) => {
        if (this.gone) return;
        if (!body || !body.ok) {
          this.setStatus(plainReason(body && body.reason));
          return;
        }
        writePrefs(prefs, body.updatedAt || Date.now());
        this.setStatus(this.statusText(body.quota));
      })
      .catch((error) => {
        if (this.gone) return;
        this.setStatus(plainReason(error && error.message));
      });
  },
  toggle(key, value) {
    const on = Boolean(value);
    this.localEdits = true;
    const prefs = { ...this.currentPrefs(), [key]: on };
    this.setData({ [key]: on });
    if (on) this.askSubscribe(prefs);
    else this.enqueue(prefs, 0);
  },
  onDaily(event) {
    this.toggle("daily", event.detail.value);
  },
  onMonthly(event) {
    this.toggle("monthly", event.detail.value);
  },
  onYearly(event) {
    this.toggle("yearly", event.detail.value);
  },
  onTime(event) {
    const match = /^(\d{1,2}):(\d{1,2})$/.exec(String(event.detail.value || ""));
    if (!match) return;
    const hour = Number(match[1]);
    const minute = Number(match[2]);
    if (hour > 23 || minute > 59) return;
    this.localEdits = true;
    this.setData({ timeValue: `${pad(hour)}:${pad(minute)}` });
    this.enqueue({ ...this.currentPrefs(), hour, minute }, 0);
  },
  onMonthDay(event) {
    const monthDay = Number(event.detail.value) + 1;
    this.localEdits = true;
    this.setData({ monthDay });
    this.enqueue({ ...this.currentPrefs(), monthDay }, 0);
  },
  onYearMonth(event) {
    const yearMonth = Number(event.detail.value) + 1;
    this.localEdits = true;
    this.setData({ yearMonth });
    this.enqueue({ ...this.currentPrefs(), yearMonth }, 0);
  },
  onYearDay(event) {
    const yearDay = Number(event.detail.value) + 1;
    this.localEdits = true;
    this.setData({ yearDay });
    this.enqueue({ ...this.currentPrefs(), yearDay }, 0);
  },
  allowAgain() {
    this.localEdits = true;
    this.askSubscribe(this.currentPrefs());
  },
  askSubscribe(prefs) {
    const templateId = this.data.templateId || cachedTemplateId();
    const snapshot = prefs || this.currentPrefs();
    if (!templateId) {
      wx.showToast({ title: "模板还没配好", icon: "none" });
      this.enqueue(snapshot, 0);
      return;
    }
    wx.requestSubscribeMessage({
      tmplIds: [templateId],
      success: (res) => {
        const accepted = res[templateId] === "accept" ? 1 : 0;
        if (!accepted) wx.showToast({ title: "这次没有点允许", icon: "none" });
        this.enqueue(snapshot, accepted);
      },
      fail: (error) => {
        console.warn("[wechat-summary] 没有弹出允许", error && error.errMsg);
        wx.showToast({ title: "微信没有弹出允许", icon: "none" });
        this.enqueue(snapshot, 0);
      },
    });
  },
});
