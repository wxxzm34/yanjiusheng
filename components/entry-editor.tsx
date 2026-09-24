"use client";

import { useState } from "react";
import { MoodPicker } from "@/components/mood-picker";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { drinkTitle } from "@/lib/stats";
import { formatTime } from "@/lib/time";
import type { DrinkType, Entry } from "@/lib/types";
import { DRINK_TYPES } from "@/lib/types";
import { cn } from "cn";

export function EntryEditor({
  entry,
  onClose,
}: {
  entry: Entry | null;
  onClose: () => void;
}) {
  return (
    <Dialog open={!!entry} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        {entry && <EditorBody key={entry.id} entry={entry} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}

function EditorBody({ entry, onClose }: { entry: Entry; onClose: () => void }) {
  const { saveEntry, deleteEntry } = useApp();
  const [draft, setDraft] = useState<Entry>(entry);
  const [confirming, setConfirming] = useState(false);

  function save() {
    if (draft.kind === "drink") {
      const drinkLabel =
        draft.drinkType === "其他" ? draft.drinkLabel.trim().slice(0, 12) || "其他" : draft.drinkType;
      saveEntry({ ...draft, drinkLabel, location: draft.location.trim().slice(0, 24) });
    } else {
      saveEntry(draft);
    }
    onClose();
  }

  if (confirming) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>删掉这条？</DialogTitle>
          <DialogDescription>
            {formatTime(draft.at)} 的{draft.kind === "smoke" ? "烟" : drinkTitle(draft)}
            会从今天的数和月报里消失。
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-2">
          <Button type="button" variant="outline" className="h-11! flex-1" onClick={() => setConfirming(false)}>
            留下
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11! flex-1"
            data-testid="confirm-delete"
            onClick={() => {
              deleteEntry(draft.id);
              onClose();
            }}
          >
            删掉
          </Button>
        </div>
      </>
    );
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{draft.kind === "smoke" ? "改这支烟" : "改这杯酒"}</DialogTitle>
        <DialogDescription>{formatTime(draft.at)} 记下的。时间不动，心情和酒的信息可以改。</DialogDescription>
      </DialogHeader>
      <MoodPicker prefix="edit" label="心情" value={draft.mood} onChange={(mood) => setDraft({ ...draft, mood })} />
      {draft.kind === "drink" && (
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-2">
            {DRINK_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                data-testid={`edit-drink-${type}`}
                aria-pressed={draft.drinkType === type}
                onClick={() =>
                  setDraft({
                    ...draft,
                    drinkType: type as DrinkType,
                    drinkLabel: type === "其他" ? "" : type,
                  })
                }
                className={cn(
                  "h-10 rounded-2xl text-sm",
                  draft.drinkType === type
                    ? "bg-[var(--skin-accent)] text-[var(--primary-foreground)]"
                    : "bg-white ring-1 ring-black/5",
                )}
              >
                {type}
              </button>
            ))}
          </div>
          {draft.drinkType === "其他" && (
            <div className="grid gap-2">
              <Label htmlFor="edit-label">名字</Label>
              <Input
                id="edit-label"
                data-testid="edit-label"
                maxLength={12}
                value={draft.drinkLabel}
                onChange={(event) => setDraft({ ...draft, drinkLabel: event.target.value })}
                className="h-11! text-base"
              />
            </div>
          )}
          <div className="grid gap-2">
            <Label htmlFor="edit-location">地点</Label>
            <Input
              id="edit-location"
              data-testid="edit-location"
              maxLength={24}
              value={draft.location}
              onChange={(event) => setDraft({ ...draft, location: event.target.value })}
              className="h-11! text-base"
            />
          </div>
        </div>
      )}
      <div className="flex gap-2">
        <Button type="button" variant="outline" className="h-11! flex-1" onClick={() => setConfirming(true)}>
          删掉
        </Button>
        <Button type="button" className="h-11! flex-1" data-testid="edit-save" onClick={save}>
          保存
        </Button>
      </div>
    </>
  );
}
