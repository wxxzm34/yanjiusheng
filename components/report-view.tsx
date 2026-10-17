"use client";

import { useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { DataActions } from "@/components/data-actions";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  daySeries,
  drinkParts,
  filterMonth,
  filterYear,
  listMonths,
  listYears,
  monthSeries,
  summarize,
} from "@/lib/stats";
import { currentPeriod, formatMonth } from "@/lib/time";
import { MOODS, MOOD_COLORS, UNSET_MOOD_COLOR } from "@/lib/types";

export function ReportView() {
  const { entries, openShare } = useApp();
  const today = currentPeriod();
  const [tab, setTab] = useState("month");
  const [pickedMonth, setPickedMonth] = useState<string | null>(null);
  const [pickedYear, setPickedYear] = useState<number | null>(null);

  const months = useMemo(() => listMonths(entries), [entries]);
  const years = useMemo(() => listYears(entries), [entries]);
  const activeMonth = pickedMonth
    ? months.find((item) => item.key === pickedMonth) ?? {
        year: today.year,
        month: today.month,
        key: `${today.year}-${today.month}`,
      }
    : { year: today.year, month: today.month, key: `${today.year}-${today.month}` };
  const activeYear = pickedYear ?? today.year;

  const monthEntries = useMemo(
    () => filterMonth(entries, activeMonth.year, activeMonth.month),
    [entries, activeMonth.year, activeMonth.month],
  );
  const yearEntries = useMemo(() => filterYear(entries, activeYear), [entries, activeYear]);
  const monthSummary = useMemo(() => summarize(monthEntries), [monthEntries]);
  const yearSummary = useMemo(() => summarize(yearEntries), [yearEntries]);
  const days = useMemo(
    () => daySeries(entries, activeMonth.year, activeMonth.month),
    [entries, activeMonth.year, activeMonth.month],
  );
  const monthsOfYear = useMemo(() => monthSeries(entries, activeYear), [entries, activeYear]);

  function shareCurrent() {
    if (tab === "year") openShare({ focus: "year", year: activeYear, month: activeMonth.month });
    else openShare({ focus: "month", year: activeMonth.year, month: activeMonth.month });
  }

  return (
    <div className="px-4 pt-5">
      <header className="paper-card mb-4 flex items-start justify-between gap-3 rounded-3xl px-4 py-3">
        <div>
          <h1 className="font-display text-4xl">报告</h1>
        </div>
        <Button type="button" className="h-10! rounded-full" data-testid="share-open-report" onClick={shareCurrent}>
          分享
        </Button>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-11! w-full">
          <TabsTrigger value="month" data-testid="report-tab-month" className="flex-1">
            月报
          </TabsTrigger>
          <TabsTrigger value="year" data-testid="report-tab-year" className="flex-1">
            年报
          </TabsTrigger>
        </TabsList>

        <TabsContent value="month" className="mt-4 space-y-3">
          <PeriodChips
            items={months.map((item) => ({
              id: item.key,
              label: formatMonth(item.year, item.month),
              active: item.year === activeMonth.year && item.month === activeMonth.month && monthEntries.length > 0,
            }))}
            onPick={(id) => setPickedMonth(id)}
            emptyHint={months.length === 0 ? "" : "有记录的月份"}
          />
          {pickedMonth && (
            <button type="button" className="text-sm underline decoration-dotted" onClick={() => setPickedMonth(null)}>
              回到本月
            </button>
          )}
          <h2 className="font-display text-2xl" data-testid="report-month-title">
            {formatMonth(activeMonth.year, activeMonth.month)}
          </h2>
          {monthEntries.length === 0 ? (
            <EmptyReport body="这个月还没有留下痕迹。去记一笔，月报会自己长出来。" />
          ) : (
            <>
              <Totals
                smokes={monthSummary.smokes}
                drinks={monthSummary.drinks}
                baijiuMl={monthSummary.baijiuMl}
                testId="month-smoke-total"
              />
              <DrinkMix summary={monthSummary} />
              <MoodMix summary={monthSummary} />
              <DayChart days={days} />
            </>
          )}
        </TabsContent>

        <TabsContent value="year" className="mt-4 space-y-3">
          <PeriodChips
            items={years.map((year) => ({
              id: String(year),
              label: `${year}年`,
              active: year === activeYear && yearEntries.length > 0,
            }))}
            onPick={(id) => setPickedYear(Number(id))}
            emptyHint={years.length === 0 ? "" : "有记录的年份"}
          />
          {pickedYear !== null && (
            <button type="button" className="text-sm underline decoration-dotted" onClick={() => setPickedYear(null)}>
              回到今年
            </button>
          )}
          <h2 className="font-display text-2xl" data-testid="report-year-title">
            {activeYear}年
          </h2>
          {yearEntries.length === 0 ? (
            <EmptyReport body="这一年还是空的。记过的月份会出现在上面。" />
          ) : (
            <>
              <Totals
                smokes={yearSummary.smokes}
                drinks={yearSummary.drinks}
                baijiuMl={yearSummary.baijiuMl}
                testId="year-smoke-total"
              />
              <YearChart points={monthsOfYear} />
              <DrinkMix summary={yearSummary} />
              <MoodMix summary={yearSummary} />
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function EmptyReport({ body }: { body: string }) {
  return (
    <div className="paper-card rounded-3xl p-4" data-testid="report-empty">
      <p className="font-display text-2xl">空白的一页</p>
      <p className="mt-1 text-sm leading-6 opacity-80">{body}</p>
      <div className="mt-3">
        <DataActions clear={false} />
      </div>
    </div>
  );
}

function PeriodChips({
  items,
  onPick,
  emptyHint,
}: {
  items: { id: string; label: string; active: boolean }[];
  onPick: (id: string) => void;
  emptyHint: string;
}) {
  if (items.length === 0) return null;
  return (
    <div>
      {emptyHint && <p className="mb-2 text-xs opacity-70">{emptyHint}</p>}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            data-testid={`period-${item.id}`}
            aria-pressed={item.active}
            onClick={() => onPick(item.id)}
            className={`shrink-0 rounded-full px-3 py-2 text-sm ${
              item.active
                ? "bg-[var(--skin-accent)] text-[var(--primary-foreground)]"
                : "bg-white/80 text-[var(--skin-ink)]"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Totals({
  smokes,
  drinks,
  baijiuMl,
  testId,
}: {
  smokes: number;
  drinks: number;
  baijiuMl: number;
  testId: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <div className="paper-card rounded-3xl p-4">
        <p className="text-sm">烟</p>
        <p className="font-display text-4xl" data-testid={testId}>
          {smokes}
          <span className="ml-1 text-lg">支</span>
        </p>
      </div>
      <div className="paper-card rounded-3xl p-4">
        <p className="text-sm">酒</p>
        <p className="font-display text-4xl">
          {drinks}
          <span className="ml-1 text-lg">杯</span>
        </p>
        {baijiuMl > 0 ? <p className="mt-1 text-sm">用量 {baijiuMl} 毫升</p> : null}
      </div>
    </div>
  );
}

function DrinkMix({ summary }: { summary: ReturnType<typeof summarize> }) {
  const parts = drinkParts(summary);
  const max = Math.max(1, ...parts.map((item) => item.count));
  return (
    <section className="paper-card rounded-3xl p-4">
      <h3 className="font-medium">酒的种类</h3>
      {parts.length === 0 ? (
        <p className="mt-2 text-sm opacity-70">这段没有喝酒。</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {parts.map((item) => (
            <li key={item.type}>
              <div className="mb-1 flex justify-between text-sm">
                <span>{item.type}</span>
                <span>
                  {item.type === "白酒"
                    ? [
                        item.count > 0 ? `${item.count} 杯` : null,
                        item.ml > 0 ? `用量 ${item.ml} 毫升` : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : item.count}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/5">
                <div
                  className="h-full rounded-full bg-[var(--skin-accent)]"
                  style={{ width: `${(item.count / max) * 100}%` }}
                />
              </div>
              {item.labels.length > 0 && (
                <p className="mt-1 text-xs opacity-70">
                  {item.labels.map((label) => `${label.label} ${label.count}`).join(" · ")}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function MoodMix({ summary }: { summary: ReturnType<typeof summarize> }) {
  const total = MOODS.reduce((sum, mood) => sum + summary.moods[mood], 0) + summary.unset;
  const segments = [
    ...MOODS.map((mood) => ({ key: mood, count: summary.moods[mood], color: MOOD_COLORS[mood] })),
    { key: "未选", count: summary.unset, color: UNSET_MOOD_COLOR },
  ].filter((item) => item.count > 0);
  return (
    <section className="paper-card rounded-3xl p-4">
      <h3 className="font-medium">心情</h3>
      {total === 0 ? (
        <p className="mt-2 text-sm opacity-70">还没有心情。</p>
      ) : (
        <>
          <div className="mt-3 flex h-4 overflow-hidden rounded-full" aria-hidden="true">
            {segments.map((item) => (
              <div key={item.key} style={{ width: `${(item.count / total) * 100}%`, background: item.color }} />
            ))}
          </div>
          <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-sm">
            {segments.map((item) => (
              <li key={item.key} className="flex items-center gap-1">
                <span className="size-2.5 rounded-full" style={{ background: item.color }} />
                {item.key} {item.count}
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

function SeriesLegend() {
  return (
    <div className="mt-2 flex gap-4 text-xs">
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rounded-full bg-[var(--skin-accent)]" />
        烟
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="size-2.5 rotate-45 bg-[#3c7d9e]" />
        酒
      </span>
    </div>
  );
}

function DayChart({ days }: { days: { day: number; smokes: number; drinks: number }[] }) {
  const max = Math.max(1, ...days.map((day) => Math.max(day.smokes, day.drinks)));
  return (
    <section className="paper-card rounded-3xl p-4" data-testid="day-chart">
      <h3 className="font-medium">按天</h3>
      <SeriesLegend />
      <div className="mt-3 flex h-28 items-end gap-px" role="img" aria-label="这个月每天的烟和酒">
        {days.map((day) => (
          <div key={day.day} className="flex h-full flex-1 items-end justify-center gap-0.5" title={`${day.day}日 烟${day.smokes} 酒${day.drinks}`}>
            <div
              className="w-2/5 rounded-t bg-[var(--skin-accent)]"
              style={{ height: `${Math.max(day.smokes > 0 ? 8 : 0, (day.smokes / max) * 100)}%` }}
            />
            <div
              className="w-2/5 rounded-t bg-[#3c7d9e]"
              style={{ height: `${Math.max(day.drinks > 0 ? 8 : 0, (day.drinks / max) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[10px] opacity-60">
        <span>1</span>
        <span>10</span>
        <span>20</span>
        <span>{days.length}</span>
      </div>
    </section>
  );
}

function YearChart({ points }: { points: { month: number; smokes: number; drinks: number }[] }) {
  const max = Math.max(1, ...points.map((point) => Math.max(point.smokes, point.drinks)));
  return (
    <section className="paper-card rounded-3xl p-4" data-testid="year-chart">
      <h3 className="font-medium">每月</h3>
      <SeriesLegend />
      <div className="mt-3 flex h-32 items-end gap-1" role="img" aria-label="这一年每个月的烟和酒">
        {points.map((point) => (
          <div key={point.month} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center gap-0.5">
              <div
                className="w-2/5 rounded-t bg-[var(--skin-accent)]"
                style={{ height: `${(point.smokes / max) * 100}%` }}
              />
              <div className="w-2/5 rounded-t bg-[#3c7d9e]" style={{ height: `${(point.drinks / max) * 100}%` }} />
            </div>
            <span className="text-[10px]">{point.month}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
