"use client";

import { useState } from "react";
import { useApp } from "@/components/app-provider";
import { DataActions } from "@/components/data-actions";
import { EntryEditor } from "@/components/entry-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { normalizeCount } from "@/lib/quantity";
import { drinkTitle, groupByDay } from "@/lib/stats";
import { formatDayLabel, formatTime } from "@/lib/time";
import type { Entry } from "@/lib/types";

export function HistoryView() {
  const { entries, deleteEntry } = useApp();
  const [editing, setEditing] = useState<Entry | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Entry | null>(null);
  const groups = groupByDay(entries);

  return (
    <div className="px-4 pt-5">
      <header className="paper-card mb-4 rounded-3xl px-4 py-3">
        <div>
          <h1 className="font-display text-4xl">记录</h1>
          <p className="mt-1 text-sm opacity-80">今天和更早的都在这儿，支数按记下的数量加总。</p>
        </div>
      </header>

      {groups.length === 0 ? (
        <div className="paper-card rounded-3xl p-4" data-testid="history-empty">
          <p className="font-display text-2xl">还没有记录</p>
          <p className="mt-1 text-sm leading-6 opacity-80">抽过、喝过，都可以轻轻记一笔。</p>
          <div className="mt-3">
            <DataActions clear={false} />
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((group) => {
            const smokes = group.entries.reduce(
              (sum, entry) => sum + (entry.kind === "smoke" ? normalizeCount(entry.count) : 0),
              0,
            );
            const drinks = group.entries.reduce(
              (sum, entry) => sum + (entry.kind === "drink" ? normalizeCount(entry.count) : 0),
              0,
            );
            return (
              <section key={group.day} className="paper-card rounded-3xl p-4">
                <h2 className="font-medium">
                  {formatDayLabel(group.day)} · {smokes} 支烟 · {drinks} 杯酒
                </h2>
                <ul className="mt-3 space-y-2">
                  {group.entries.map((entry) => (
                    <li
                      key={entry.id}
                      data-testid="history-entry"
                      className="flex items-center gap-2 rounded-2xl bg-white/75 px-3 py-2"
                    >
                      <button type="button" className="min-w-0 flex-1 text-left" onClick={() => setEditing(entry)}>
                        <p className="text-sm font-medium">
                          {formatTime(entry.at)} · {entry.kind === "smoke" ? "烟" : drinkTitle(entry)}
                          {entry.count > 1 ? ` ×${entry.count}` : ""}
                        </p>
                        <p className="truncate text-xs opacity-70">
                          {entry.kind === "drink"
                            ? entry.location || "地点空着"
                            : entry.count > 1
                              ? `${entry.count} 支烟`
                              : "一支烟"}
                        </p>
                      </button>
                      <Badge variant={entry.mood ? "secondary" : "outline"}>{entry.mood ?? "未选"}</Badge>
                      <Button type="button" variant="ghost" className="h-9! px-2" onClick={() => setEditing(entry)}>
                        改
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9! px-2"
                        data-testid="delete-entry"
                        onClick={() => setPendingDelete(entry)}
                      >
                        删
                      </Button>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
          <DataActions sample={false} />
        </div>
      )}

      <EntryEditor entry={editing} onClose={() => setEditing(null)} />

      {pendingDelete && (
        <DeleteConfirm
          entry={pendingDelete}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteEntry(pendingDelete.id);
            setPendingDelete(null);
          }}
        />
      )}
    </div>
  );
}

function DeleteConfirm({
  entry,
  onCancel,
  onConfirm,
}: {
  entry: Entry;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>删掉这条？</DialogTitle>
          <DialogDescription>
            {formatTime(entry.at)} 的
            {entry.count > 1 ? `${entry.count} ${entry.kind === "smoke" ? "支烟" : `杯${drinkTitle(entry)}`}` : entry.kind === "smoke" ? "烟" : drinkTitle(entry)}
            不会再算进支数。
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-11! flex-1" onClick={onCancel}>
            留下
          </Button>
          <Button type="button" variant="destructive" className="h-11! flex-1" data-testid="confirm-delete" onClick={onConfirm}>
            删掉
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
