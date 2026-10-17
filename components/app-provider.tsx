"use client";

import { createContext, useContext, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import { DEFAULT_BG_ID, DEFAULT_SKIN_ID, getBackground, getOutfit, getSkin, type BackgroundPack, type Skin } from "@/lib/packs";
import { buildSample } from "@/lib/sample";
import { normalizeCount, normalizeMl } from "@/lib/quantity";
import { STORAGE_KEY, cleanNote, createId, defaultData, loadData, persistData, sanitizeData } from "@/lib/storage";
import type { AppData, DrinkEntry, DrinkType, Entry, Mood, ShareTarget, SmokeEntry } from "@/lib/types";

const CHANGE_EVENT = "yanjiusheng-change";
const READ_ERROR = "__yanjiusheng_error__";

type AppContextValue = {
  ready: boolean;
  loadError: boolean;
  saveError: string | null;
  entries: Entry[];
  skin: Skin;
  background: BackgroundPack;
  unlockedIds: string[];
  pendingPackId: string | null;
  downloadPack: (id: string) => void;
  applyOutfit: (id: string) => void;
  addSmoke: (mood: Mood | null, count?: number, note?: string) => SmokeEntry;
  addDrink: (input: {
    mood: Mood | null;
    note?: string;
    drinkType: DrinkType;
    drinkLabel: string;
    location: string;
    count?: number;
    unit?: "ml" | "cup";
  }) => DrinkEntry;
  saveEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  loadSample: () => void;
  clearEntries: () => void;
  reload: () => void;
  resetAll: () => void;
  share: ShareTarget | null;
  openShare: (target: ShareTarget) => void;
  closeShare: () => void;
};

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const value = useContext(AppContext);
  if (!value) throw new Error("useApp 需要放在 AppProvider 里");
  return value;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "";
  } catch {
    return READ_ERROR;
  }
}

function notify() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function readNow(): AppData {
  try {
    return loadData();
  } catch {
    return defaultData();
  }
}

function parseRaw(raw: string) {
  if (raw === READ_ERROR) return { data: defaultData(), error: true };
  if (!raw) return { data: defaultData(), error: false };
  try {
    return { data: sanitizeData(JSON.parse(raw)), error: false };
  } catch {
    return { data: defaultData(), error: true };
  }
}

function write(next: AppData) {
  persistData(next);
  notify();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const ready = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const raw = useSyncExternalStore(subscribe, getSnapshot, () => "");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [pendingPackId, setPendingPackId] = useState<string | null>(null);
  const [share, setShare] = useState<ShareTarget | null>(null);
  const parsed = useMemo(
    () => (ready ? parseRaw(raw) : { data: defaultData(), error: false }),
    [raw, ready],
  );

  const value = useMemo<AppContextValue>(() => {
    const data = parsed.data;
    const skin = getSkin(data.activeSkinId) ?? getSkin(DEFAULT_SKIN_ID)!;
    const background = getBackground(data.activeBgId) ?? getBackground(DEFAULT_BG_ID)!;

    function commit(recipe: (prev: AppData) => AppData) {
      const next = recipe(readNow());
      try {
        write(next);
        setSaveError(null);
      } catch {
        setSaveError("没能写进浏览器，这条可能没留下。");
      }
    }

    return {
      ready,
      loadError: parsed.error,
      saveError,
      entries: data.entries,
      skin,
      background,
      unlockedIds: data.unlockedIds,
      pendingPackId,
      downloadPack: (id: string) => {
        if (readNow().unlockedIds.includes(id) || pendingPackId === id) return;
        setPendingPackId(id);
        window.setTimeout(() => {
          setPendingPackId((current) => (current === id ? null : current));
          commit((prev) =>
            prev.unlockedIds.includes(id) ? prev : { ...prev, unlockedIds: [...prev.unlockedIds, id] },
          );
        }, 700);
      },
      applyOutfit: (id: string) => {
        commit((prev) => {
          if (!getOutfit(id) || !prev.unlockedIds.includes(id)) return prev;
          if (prev.activeSkinId === id && prev.activeBgId === id) return prev;
          return { ...prev, activeSkinId: id, activeBgId: id };
        });
      },
      addSmoke: (mood: Mood | null, count = 1, note = "") => {
        const text = cleanNote(note);
        const entry: SmokeEntry = {
          id: createId(),
          kind: "smoke",
          at: Date.now(),
          mood,
          count: normalizeCount(count),
        };
        if (text) entry.note = text;
        commit((prev) => ({ ...prev, entries: [entry, ...prev.entries] }));
        return entry;
      },
      addDrink: (input) => {
        const label =
          input.drinkType === "其他" ? input.drinkLabel.trim().slice(0, 12) || "其他" : input.drinkType;
        const volume = input.drinkType === "白酒";
        const text = cleanNote(input.note);
        const entry: DrinkEntry = {
          id: createId(),
          kind: "drink",
          at: Date.now(),
          mood: input.mood,
          drinkType: input.drinkType,
          drinkLabel: label,
          location: input.location.trim().slice(0, 24),
          count: volume ? normalizeMl(input.count) : normalizeCount(input.count),
          ...(volume ? { unit: "ml" as const } : {}),
        };
        if (text) entry.note = text;
        commit((prev) => ({ ...prev, entries: [entry, ...prev.entries] }));
        return entry;
      },
      saveEntry: (entry: Entry) => {
        commit((prev) => ({
          ...prev,
          entries: prev.entries.map((item) => (item.id === entry.id ? entry : item)),
        }));
      },
      deleteEntry: (id: string) => {
        commit((prev) => ({ ...prev, entries: prev.entries.filter((item) => item.id !== id) }));
      },
      loadSample: () => {
        commit((prev) => ({ ...prev, entries: buildSample(Date.now()) }));
      },
      clearEntries: () => {
        commit((prev) => ({ ...prev, entries: [] }));
      },
      reload: () => notify(),
      resetAll: () => {
        try {
          write(defaultData());
          setSaveError(null);
        } catch {
          setSaveError("浏览器不肯清空本地记录。");
        }
      },
      share,
      openShare: (target: ShareTarget) => setShare(target),
      closeShare: () => setShare(null),
    };
  }, [parsed.data, parsed.error, pendingPackId, ready, saveError, share]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}
