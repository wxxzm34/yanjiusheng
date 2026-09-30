const { apiBase } = require("../config");
const { load } = require("./storage");

const SESSION_KEY = "yanjiusheng.wxsession";
const TEMPLATE_KEY = "yanjiusheng.templateId";

let entryTimer = null;
let warnedEmpty = false;

function base() {
  return String(apiBase || "").trim().replace(/\/$/, "");
}

function hasServer() {
  return Boolean(base());
}

function request(path, method, data, token) {
  return new Promise((resolve, reject) => {
    const header = token ? { Authorization: `Bearer ${token}` } : {};
    wx.request({
      url: `${base()}${path}`,
      method,
      data: method === "GET" ? undefined : data,
      header,
      success(res) {
        resolve(res);
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

function loginCode() {
  return new Promise((resolve, reject) => {
    wx.login({
      success(res) {
        if (res.code) resolve(res.code);
        else reject(new Error("微信没有给登录码"));
      },
      fail(error) {
        reject(error);
      },
    });
  });
}

async function sessionToken(force) {
  if (!hasServer()) throw new Error("还没填服务器地址");
  if (!force) {
    const cached = wx.getStorageSync(SESSION_KEY);
    if (cached && cached.token && cached.exp > Date.now() + 60000) return cached.token;
  }
  const code = await loginCode();
  const res = await request("/api/wechat/session", "POST", { code });
  const body = res.data || {};
  if (!body.ok || !body.token) throw new Error(body.reason || "微信登录失败");
  wx.setStorageSync(SESSION_KEY, { token: body.token, exp: body.exp });
  return body.token;
}

async function authorized(path, method, data, retry) {
  const token = await sessionToken(Boolean(retry));
  const res = await request(path, method, data, token);
  if (res.statusCode === 401 && !retry) {
    wx.removeStorageSync(SESSION_KEY);
    return authorized(path, method, data, true);
  }
  return res.data || {};
}

function scheduleEntrySync() {
  if (!hasServer()) {
    if (!warnedEmpty) {
      warnedEmpty = true;
      console.warn("[wechat-summary] 没填 apiBase，记录只留在手机里");
    }
    return;
  }
  if (entryTimer) clearTimeout(entryTimer);
  entryTimer = setTimeout(() => {
    entryTimer = null;
    syncEntries().catch((error) => {
      const message = error && error.message ? error.message : error;
      console.warn("[wechat-summary] 记录没传上去", message);
    });
  }, 500);
}

function syncEntries() {
  const data = load();
  const entries = (data.entries || []).map((entry) => ({ kind: entry.kind, at: entry.at }));
  return authorized("/api/wechat/sync", "POST", { entries });
}

function postSync(payload) {
  return authorized("/api/wechat/sync", "POST", payload);
}

function fetchState() {
  return authorized("/api/wechat/sync", "GET");
}

async function fetchTemplateId() {
  if (!hasServer()) return "";
  try {
    const res = await request("/api/wechat/config", "GET");
    const body = res.data || {};
    if (!body.ok) return wx.getStorageSync(TEMPLATE_KEY) || "";
    const id = body.templateId ? String(body.templateId) : "";
    wx.setStorageSync(TEMPLATE_KEY, id);
    return id;
  } catch (error) {
    return wx.getStorageSync(TEMPLATE_KEY) || "";
  }
}

function cachedTemplateId() {
  return wx.getStorageSync(TEMPLATE_KEY) || "";
}

module.exports = {
  hasServer,
  scheduleEntrySync,
  syncEntries,
  postSync,
  fetchState,
  fetchTemplateId,
  cachedTemplateId,
};
