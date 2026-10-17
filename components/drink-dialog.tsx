"use client";

import { useState } from "react";
import { MoodNote } from "@/components/mood-note";
import { MoodPicker } from "@/components/mood-picker";
import { QuantityStepper } from "@/components/quantity-stepper";
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
import { DEFAULT_BAIJIU_ML, MAX_ML, normalizeCount, normalizeMl } from "@/lib/quantity";
import type { DrinkType, Mood } from "@/lib/types";
import { DRINK_TYPES } from "@/lib/types";
import { cn } from "cn";

export function DrinkDialog({
  open,
  draftMood,
  draftNote = "",
  initialCount = 1,
  recentLocations,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  draftMood: Mood | null;
  draftNote?: string;
  initialCount?: number;
  recentLocations: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (input: {
    mood: Mood | null;
    note?: string;
    drinkType: DrinkType;
    drinkLabel: string;
    location: string;
    count: number;
    unit?: "ml" | "cup";
  }) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        {open && (
          <DrinkForm
            draftMood={draftMood}
            draftNote={draftNote}
            initialCount={initialCount}
            recentLocations={recentLocations}
            onSave={(input) => {
              onSave(input);
              onOpenChange(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function DrinkForm({
  draftMood,
  draftNote,
  initialCount,
  recentLocations,
  onSave,
}: {
  draftMood: Mood | null;
  draftNote: string;
  initialCount: number;
  recentLocations: string[];
  onSave: (input: {
    mood: Mood | null;
    note?: string;
    drinkType: DrinkType;
    drinkLabel: string;
    location: string;
    count: number;
    unit?: "ml" | "cup";
  }) => void;
}) {
  const [drinkType, setDrinkType] = useState<DrinkType>("啤酒");
  const [qty, setQty] = useState(() => String(normalizeCount(initialCount)));
  const volume = drinkType === "白酒";

  function chooseType(type: DrinkType) {
    if (type === "白酒" && drinkType !== "白酒") setQty(String(DEFAULT_BAIJIU_ML));
    if (type !== "白酒" && drinkType === "白酒") setQty(String(normalizeCount(initialCount)));
    setDrinkType(type);
  }
  const [drinkLabel, setDrinkLabel] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState<Mood | null>(draftMood);
  const [note, setNote] = useState(draftNote);

  return (
    <>
      <DialogHeader>
        <DialogTitle>{volume ? "记白酒" : "记一杯"}</DialogTitle>
        <DialogDescription>
          {volume ? "用量按毫升记，心情和地点随便。" : "种类要选，心情和地点随便，不选也能记下。"}
        </DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({
            mood,
            note,
            drinkType,
            drinkLabel,
            location,
            count: volume ? normalizeMl(qty) : normalizeCount(qty),
            unit: volume ? "ml" : "cup",
          });
        }}
      >
        <div className="grid grid-cols-3 gap-2">
          {DRINK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              data-testid={`drink-type-${type}`}
              aria-pressed={drinkType === type}
              onClick={() => chooseType(type)}
              className={cn(
                "h-11 rounded-2xl text-sm font-medium",
                drinkType === type
                  ? "bg-[var(--skin-accent)] text-[var(--primary-foreground)]"
                  : "bg-white text-[#2b2118] ring-1 ring-black/5",
              )}
            >
              {type}
            </button>
          ))}
        </div>
        {drinkType === "其他" && (
          <div className="grid gap-2">
            <Label htmlFor="drink-label">这杯叫什么</Label>
            <Input
              id="drink-label"
              data-testid="drink-label"
              maxLength={12}
              value={drinkLabel}
              placeholder="比如桂花酿"
              onChange={(event) => setDrinkLabel(event.target.value)}
              className="h-11! text-base"
            />
          </div>
        )}
        <MoodPicker prefix="drink" label={volume ? "心情" : "这杯的心情"} value={mood} onChange={setMood} />
        <MoodNote value={note} onChange={setNote} testId="drink-note" />
        <div className="grid gap-2">
          <Label htmlFor="drink-location">在哪儿喝的</Label>
          <Input
            id="drink-location"
            data-testid="drink-location"
            maxLength={24}
            value={location}
            placeholder="可以不填"
            onChange={(event) => setLocation(event.target.value)}
            className="h-11! text-base"
          />
          {recentLocations.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recentLocations.map((item) => (
                <button
                  key={item}
                  type="button"
                  className="rounded-full bg-white px-3 py-1 text-xs ring-1 ring-black/5"
                  onClick={() => setLocation(item)}
                >
                  {item}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex items-center justify-between gap-3">
          <Label>
            {volume ? "用量" : "几杯"}
            {volume ? <span className="ml-1 text-sm font-normal">毫升</span> : null}
          </Label>
          <QuantityStepper value={qty} onChange={setQty} testId="drink-qty" max={volume ? MAX_ML : undefined} />
        </div>
        <Button type="submit" className="h-12! text-base" data-testid="drink-save">
          记下来
        </Button>
      </form>
    </>
  );
}
