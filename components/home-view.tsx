"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { CartoonStage, type Gag } from "@/components/art/stage";
import { useApp } from "@/components/app-provider";
import { DataActions } from "@/components/data-actions";
import { DrinkDialog } from "@/components/drink-dialog";
import { EntryEditor } from "@/components/entry-editor";
import { MoodPicker } from "@/components/mood-picker";
import { Button } from "@/components/ui/button";
import { drinkTitle } from "@/lib/stats";
import { currentPeriod, formatTime, greeting } from "@/lib/time";
import { startOfDay } from "@/lib/time";
import type { Entry, Mood } from "@/lib/types";

export function HomeView() {
  const app = useApp();
  const [draftMood, setDraftMood] = useState<Mood | null>(null);
  const [freshId, setFreshId] = useState<string | null>(null);
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
  const smokes = today.filter((entry) => entry.kind === "smoke").length;
  const drinks = today.filter((entry) => entry.kind === "drink").length;
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
    const fresh = app.entries.find((entry) => entry.id === freshId && entry.kind === "smoke");
    if (fresh && fresh.kind === "smoke") app.saveEntry({ ...fresh, mood });
  }

  function logSmoke() {
    const entry = app.addSmoke(draftMood);
    setFreshId(entry.id);
    setLinkFresh(true);
    setNow(Date.now());
    setGag({ nonce: Date.now(), type: "smoke" });
    if (typeof navigator !== "undefined" && typeof navigator.vibrate === "function") navigator.vibrate(12);
  }

  const period = currentPeriod(new Date(now));

  return (
    <div className="px-4 pt-5">
      <header className="paper-card mb-1 flex items-start justify-between gap-3 rounded-3xl px-4 py-3">
        <div>
          <p className="font-display text-4xl leading-none text-[var(--skin-ink)]">烟酒生</p>
          <p className="mt-1 text-sm text-[var(--skin-ink)]/80">{greeting(new Date(now))}</p>
          <p className="mt-1 text-xs text-[var(--skin-ink)]/70" data-testid="active-style">
            皮肤 · {app.skin.name}　背景 · {app.background.name}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--skin-ink)]/70" data-testid="wechat-summary-note">
            微信汇总在小程序里设置。
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

      <section className="paper-card relative z-10 -mt-6 rounded-[28px] p-4">
        <p className="text-sm">今天</p>
        <p className="mt-1 font-display text-5xl leading-none" aria-live="polite">
          <span key={smokes} data-testid="today-smoke-count" className="count-pop inline-block">
            {smokes}
          </span>
          <span className="ml-2 text-2xl">支烟</span>
        </p>
        <p className="mt-2 text-sm" data-testid="today-drink-count">
          {drinks > 0 ? `还有 ${drinks} 杯酒` : "酒还没记"}
        </p>

        <div className="mt-4">
          <MoodPicker
            prefix="draft"
            value={draftMood}
            onChange={pickMood}
            label={
              linked
                ? "正在改刚才那支的心情，下一支也会带上"
                : "先选心情也行，不选直接记"
            }
          />
          {linked && (
            <button
              type="button"
              className="mt-2 text-sm underline decoration-dotted underline-offset-4"
              onClick={() => setLinkFresh(false)}
            >
              刚才那支就这样
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <button
            type="button"
            data-testid="log-smoke"
            onClick={logSmoke}
            className="sticker h-14 rounded-full bg-[var(--skin-accent)] text-lg font-medium text-[var(--primary-foreground)]"
          >
            记一支
          </button>
          <Button
            type="button"
            variant="outline"
            className="h-12! bg-white/80 text-base"
            data-testid="log-drink"
            onClick={() => setDrinkOpen(true)}
          >
            记一杯
          </Button>
        </div>
      </section>

      <section className="mt-4">
        {today.length === 0 ? (
          <div className="paper-card rounded-3xl p-4" data-testid="home-empty">
            <p className="font-display text-2xl">今天还是空白的</p>
            <p className="mt-1 text-sm leading-6 opacity-80">点上面记一支，或者先记一杯。不想从零开始的话，可以塞一段示例。</p>
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
                      className="flex w-full items-center justify-between rounded-2xl bg-white/70 px-3 py-2 text-left text-sm"
                    >
                      <span>
                        {formatTime(entry.at)} · {entry.kind === "smoke" ? "烟" : drinkTitle(entry)}
                        {entry.kind === "drink" && entry.location ? ` · ${entry.location}` : ""}
                      </span>
                      <span>{entry.mood ?? "未选"}</span>
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
        recentLocations={recentLocations}
        onOpenChange={setDrinkOpen}
        onSave={(input) => {
          const entry = app.addDrink(input);
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
