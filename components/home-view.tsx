"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartoonStage, type Gag } from "@/components/art/stage";
import { useApp } from "@/components/app-provider";
import { DataActions } from "@/components/data-actions";
import { DrinkDialog } from "@/components/drink-dialog";
import { EntryEditor } from "@/components/entry-editor";
import { MoodNote } from "@/components/mood-note";
import { MoodPicker } from "@/components/mood-picker";
import { QuantityStepper } from "@/components/quantity-stepper";
import { Button } from "@/components/ui/button";
import { MAX_COUNT, clampQty, isBaijiuMl, normalizeCount, normalizeMl } from "@/lib/quantity";
import { drinkAmountText, drinkTitle } from "@/lib/stats";
import { currentPeriod, formatTime, greeting } from "@/lib/time";
import { cleanNote } from "@/lib/storage";
import { startOfDay } from "@/lib/time";
import type { Entry, Mood } from "@/lib/types";
import { cn } from "cn";

type LogKind = "smoke" | "drink";

function mixHex(hex: string, toward: "white" | "black", amount: number) {
  const raw = hex.replace("#", "");
  const channels = [0, 2, 4].map((index) => Number.parseInt(raw.slice(index, index + 2), 16));
  const target = toward === "white" ? 255 : 0;
  const mixed = channels.map((channel) => Math.round(channel + (target - channel) * amount));
  return `#${mixed.map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
}

export function HomeView() {
  const app = useApp();
  const [draftMood, setDraftMood] = useState<Mood | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const [freshId, setFreshId] = useState<string | null>(null);
  const [freshCount, setFreshCount] = useState(1);
  const [kind, setKind] = useState<LogKind>("smoke");
  const [smokeQty, setSmokeQty] = useState("0");
  const [drinkQty, setDrinkQty] = useState("0");
  const [linkFresh, setLinkFresh] = useState(false);
  const [gag, setGag] = useState<Gag>(null);
  const [drinkOpen, setDrinkOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const freshAlive = Boolean(freshId && app.entries.some((entry) => entry.id === freshId));
  const linked = linkFresh && freshAlive;

  const today = useMemo(
    () => app.entries.filter((entry) => startOfDay(entry.at) === startOfDay(now)),
    [app.entries, now],
  );
  const baijiuMl = today.reduce(
    (sum, entry) => sum + (entry.kind === "drink" && isBaijiuMl(entry) ? normalizeMl(entry.count) : 0),
    0,
  );
  const smokeShown = clampQty(smokeQty, 0, MAX_COUNT);
  const drinkShown = clampQty(drinkQty, 0, MAX_COUNT);
  const recentLocations = useMemo(() => {
    const seen = new Set<string>();
    const list: string[] = [];
    for (const entry of app.entries) {
      if (entry.kind !== "drink" || !entry.location || seen.has(entry.location)) continue;
      seen.add(entry.location);
      list.push(entry.location);
      if (list.length === 4) break;
    }
    return list;
  }, [app.entries]);

  function pickMood(mood: Mood | null) {
    setDraftMood(mood);
    if (!linked || !freshId) return;
    const fresh = app.entries.find((entry) => entry.id === freshId);
    if (fresh) app.saveEntry({ ...fresh, mood });
  }

  function changeNote(value: string) {
    setDraftNote(value);
    if (!linked || !freshId) return;
    const fresh = app.entries.find((entry) => entry.id === freshId);
    if (!fresh) return;
    const note = cleanNote(value);
    const next = { ...fresh };
    if (note) next.note = note;
    else delete next.note;
    app.saveEntry(next);
  }

  function logSmoke(count: number) {
    const safe = normalizeCount(count);
    const entry = app.addSmoke(draftMood, safe, draftNote);
    setFreshId(entry.id);
    setFreshCount(safe);
    setLinkFresh(true);
    setNow(Date.now());
    setGag({ nonce: Date.now(), type: "smoke" });
    setSmokeQty("0");
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(12);
  }

  function record() {
    if (kind === "drink") {
      if (drinkShown < 1) return;
      setDrinkOpen(true);
      return;
    }
    if (smokeShown < 1) return;
    logSmoke(smokeShown);
  }

  const period = currentPeriod(new Date(now));
  const cardIdle = mixHex(app.skin.paper, "white", 0.16);
  const cardOn = mixHex(app.skin.paper, "black", 0.3);

  return (
    <div className="px-4 pt-5">
      <header className="paper-card mb-1 flex items-start justify-between gap-3 rounded-3xl px-4 py-3">
        <div>
          <p className="font-display text-4xl leading-none text-[var(--skin-ink)]">烟酒生</p>
          <p className="mt-1 text-sm text-[var(--skin-ink)]/80">{greeting(new Date(now))}</p>
          <p className="mt-1 text-xs text-[var(--skin-ink)]/70" data-testid="active-style">
            装扮 · {app.skin.name}
          </p>
        </div>
        <Button
          type="button"
          className="h-10! rounded-full"
          data-testid="share-open-home"
          onClick={() => app.openShare({ focus: "today", year: period.year, month: period.month })}
        >
          分享
        </Button>
      </header>

      <CartoonStage skin={app.skin} gag={gag} onSkip={() => setGag(null)} />

      <section className="relative z-10 -mt-6" data-selected={kind}>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <button
              type="button"
              data-testid="select-smoke"
              aria-pressed={kind === "smoke"}
              onClick={() => setKind("smoke")}
              style={{ background: kind === "smoke" ? cardOn : cardIdle, color: "var(--skin-ink)" }}
              className="w-full rounded-3xl px-3 py-4 text-left shadow-sm"
            >
              <p className="font-display text-4xl leading-none" aria-live="polite">
                <span key={smokeShown} data-testid="today-smoke-count" className="count-pop inline-block">
                  {smokeShown}
                </span>
                <span className="ml-1 text-lg">支烟</span>
              </p>
              <p className="mt-2 text-base font-medium">记一支</p>
            </button>
            <div className={cn("mt-2 flex justify-center", kind !== "smoke" && "opacity-40")}>
              <QuantityStepper
                value={smokeQty}
                min={0}
                testId="smoke-qty"
                onChange={(value) => {
                  setKind("smoke");
                  setSmokeQty(value);
                }}
              />
            </div>
          </div>
          <div>
            <button
              type="button"
              data-testid="select-drink"
              aria-pressed={kind === "drink"}
              onClick={() => setKind("drink")}
              style={{ background: kind === "drink" ? cardOn : cardIdle, color: "var(--skin-ink)" }}
              className="w-full rounded-3xl px-3 py-4 text-left shadow-sm"
            >
              <p className="font-display text-4xl leading-none" aria-live="polite">
                <span key={drinkShown} data-testid="today-drink-count" className="count-pop inline-block">
                  {drinkShown}
                </span>
                <span className="ml-1 text-lg">杯酒</span>
              </p>
              {baijiuMl > 0 ? <p className="mt-1 text-sm">用量 {baijiuMl} 毫升</p> : null}
              <p className="mt-2 text-base font-medium">记一杯</p>
            </button>
            <div className={cn("mt-2 flex justify-center", kind !== "drink" && "opacity-40")}>
              <QuantityStepper
                value={drinkQty}
                min={0}
                testId="drink-qty"
                onChange={(value) => {
                  setKind("drink");
                  setDrinkQty(value);
                }}
              />
            </div>
          </div>
        </div>
        <button
          type="button"
          data-testid="log-record"
          onClick={record}
          className="sticker mt-3 h-12 w-full rounded-full bg-[var(--skin-accent)] text-base font-medium text-[var(--primary-foreground)]"
        >
          记录
        </button>

        <div className="mt-4">
          <MoodPicker
            prefix="draft"
            value={draftMood}
            onChange={pickMood}
            label={linked ? "点一下改刚才记下的心情，下一笔也会带上" : "点一下，下一笔记下时带上"}
          />
          <MoodNote value={draftNote} onChange={changeNote} />
          {linked && (
            <button
              type="button"
              className="mt-2 text-sm underline decoration-dotted underline-offset-4"
              onClick={() => setLinkFresh(false)}
            >
              {freshCount > 1 ? "刚才这几笔就这样" : "刚才那笔就这样"}
            </button>
          )}
        </div>
      </section>

      <section className="mt-4">
        {today.length === 0 ? (
          <div className="paper-card rounded-3xl p-4" data-testid="home-empty">
            <p className="font-display text-2xl">今天还是空白的</p>
            <p className="mt-1 text-sm leading-6 opacity-80">先选烟或酒，再点记录。不想从零开始的话，可以塞一段示例。</p>
            <div className="mt-3">
              <DataActions clear={false} />
            </div>
          </div>
        ) : (
          <div className="paper-card rounded-3xl p-4">
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-medium">今天记下的</h2>
              <Link href="/history" className="text-sm underline decoration-dotted underline-offset-4">
                全部记录
              </Link>
            </div>
            <ul className="space-y-2">
              {today
                .slice()
                .sort((a, b) => b.at - a.at)
                .slice(0, 6)
                .map((entry) => (
                  <li key={entry.id}>
                    <button
                      type="button"
                      onClick={() => setEditing(entry)}
                      className="flex w-full items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-left text-sm text-[#2b2118]"
                    >
                      <span className="min-w-0">
                        <span className="block">
                          {formatTime(entry.at)} · {entry.kind === "smoke" ? "烟" : drinkTitle(entry)}
                          {entry.kind === "drink" && drinkAmountText(entry)
                            ? ` · ${drinkAmountText(entry)}`
                            : entry.count > 1
                              ? ` ×${entry.count}`
                              : ""}
                          {entry.kind === "drink" && entry.location ? ` · ${entry.location}` : ""}
                        </span>
                        {entry.note ? <span className="mt-1 block text-xs opacity-80">{entry.note}</span> : null}
                      </span>
                      <span className="shrink-0">{entry.mood ?? "未选"}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        )}
      </section>

      <DrinkDialog
        open={drinkOpen}
        draftMood={draftMood}
        draftNote={draftNote}
        initialCount={Math.max(1, drinkShown)}
        recentLocations={recentLocations}
        onOpenChange={setDrinkOpen}
        onSave={(input) => {
          const entry = app.addDrink(input);
          setFreshId(entry.id);
          setFreshCount(entry.unit === "ml" ? 1 : entry.count);
          setLinkFresh(true);
          setDraftMood(entry.mood);
          setDraftNote(entry.note || "");
          setDrinkQty("0");
          setNow(Date.now());
          setGag({
            nonce: Date.now(),
            type: "drink",
            drinkType: entry.drinkType,
            label: entry.drinkLabel,
          });
        }}
      />
      <EntryEditor entry={editing} onClose={() => setEditing(null)} />
    </div>
  );
}
