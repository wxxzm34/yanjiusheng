import fs from "fs";
import path from "path";
import { dataFile } from "@/lib/wechat/config";
import {
  defaultPrefs,
  sanitizeEntries,
  sanitizePrefs,
  type CountEntry,
  type Period,
  type Prefs,
} from "@/lib/wechat/summary";

export type UserRecord = {
  entries: CountEntry[];
  prefs: Prefs;
  quota: number;
  sent: Partial<Record<Period, string>>;
  inflightAt?: number;
  updatedAt: number;
};

export type Store = {
  users: Record<string, UserRecord>;
  accessToken?: { token: string; expiresAt: number };
};

export type PublicState = {
  prefs: Prefs;
  quota: number;
  entryCount: number;
  updatedAt: number;
};

const OPENID = /^[\w-]{1,64}$/;

function emptyStore(): Store {
  return { users: {} };
}

function stamp(value: unknown) {
  return typeof value === "string" && value.length <= 16 ? value : undefined;
}

export function normalizeUser(value: unknown): UserRecord {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const sentRaw = raw.sent && typeof raw.sent === "object" ? (raw.sent as Record<string, unknown>) : {};
  const sent: UserRecord["sent"] = {};
  const daily = stamp(sentRaw.daily);
  const monthly = stamp(sentRaw.monthly);
  const yearly = stamp(sentRaw.yearly);
  if (daily) sent.daily = daily;
  if (monthly) sent.monthly = monthly;
  if (yearly) sent.yearly = yearly;
  const quota = typeof raw.quota === "number" && Number.isFinite(raw.quota) ? Math.floor(raw.quota) : 0;
  const user: UserRecord = {
    entries: sanitizeEntries(raw.entries),
    prefs: sanitizePrefs(raw.prefs),
    quota: Math.min(50, Math.max(0, quota)),
    sent,
    updatedAt: typeof raw.updatedAt === "number" && Number.isFinite(raw.updatedAt) ? raw.updatedAt : 0,
  };
  if (typeof raw.inflightAt === "number" && Number.isFinite(raw.inflightAt)) user.inflightAt = raw.inflightAt;
  return user;
}

function normalizeStore(value: unknown): Store {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  const users: Record<string, UserRecord> = {};
  const rawUsers = raw.users && typeof raw.users === "object" ? (raw.users as Record<string, unknown>) : {};
  for (const key of Object.keys(rawUsers)) {
    if (!OPENID.test(key)) continue;
    users[key] = normalizeUser(rawUsers[key]);
  }
  const store: Store = { users };
  const token = raw.accessToken;
  if (token && typeof token === "object") {
    const item = token as Record<string, unknown>;
    if (typeof item.token === "string" && item.token && typeof item.expiresAt === "number") {
      store.accessToken = { token: item.token, expiresAt: item.expiresAt };
    }
  }
  return store;
}

export function publicState(user: UserRecord | undefined): PublicState {
  if (!user) return { prefs: defaultPrefs(), quota: 0, entryCount: 0, updatedAt: 0 };
  return {
    prefs: user.prefs,
    quota: user.quota,
    entryCount: user.entries.length,
    updatedAt: user.updatedAt,
  };
}

export function ensureUser(store: Store, openid: string) {
  const existing = store.users[openid];
  if (existing) return existing;
  const created = normalizeUser({ prefs: defaultPrefs(), updatedAt: Date.now() });
  store.users[openid] = created;
  return created;
}

function pidAlive(pid: number) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function lockFile(lockPath: string) {
  const started = Date.now();
  return new Promise<number>((resolve, reject) => {
    const tryOnce = () => {
      try {
        const fd = fs.openSync(lockPath, "wx");
        fs.writeSync(fd, String(process.pid));
        resolve(fd);
      } catch (error) {
        const code = (error as NodeJS.ErrnoException).code;
        if (code !== "EEXIST") {
          reject(error);
          return;
        }
        try {
          const age = Date.now() - fs.statSync(lockPath).mtimeMs;
          const pid = Number(fs.readFileSync(lockPath, "utf8"));
          if (age > 60_000 || !pidAlive(pid)) fs.unlinkSync(lockPath);
        } catch {
          // 锁可能刚被别人拿走
        }
        if (Date.now() - started > 15_000) {
          reject(new Error("数据文件正被占用"));
          return;
        }
        setTimeout(tryOnce, 40);
      }
    };
    tryOnce();
  });
}

function unlock(fd: number, lockPath: string) {
  try {
    fs.closeSync(fd);
  } catch {
    // 已经关过
  }
  try {
    fs.unlinkSync(lockPath);
  } catch {
    // 可能已被清掉
  }
}

export async function withStore<T>(fn: (store: Store) => Promise<T> | T): Promise<T> {
  const file = dataFile();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const lockPath = `${file}.lock`;
  const fd = await lockFile(lockPath);
  try {
    let previous = "";
    let store = emptyStore();
    if (fs.existsSync(file)) {
      const text = fs.readFileSync(file, "utf8");
      if (text.trim()) {
        try {
          store = normalizeStore(JSON.parse(text) as unknown);
          previous = JSON.stringify(store);
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          throw new Error(`数据文件读不了，没有覆盖：${message}`);
        }
      }
    }
    const result = await fn(store);
    const next = JSON.stringify(store);
    if (next !== previous) {
      const tmp = `${file}.${process.pid}.tmp`;
      fs.writeFileSync(tmp, next, { encoding: "utf8", mode: 0o600 });
      fs.renameSync(tmp, file);
    }
    return result;
  } finally {
    unlock(fd, lockPath);
  }
}

export function isOpenId(value: string) {
  return OPENID.test(value);
}
