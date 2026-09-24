"use client";

import { useState } from "react";
import { MoodPicker } from "@/components/mood-picker";
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
import type { DrinkType, Mood } from "@/lib/types";
import { DRINK_TYPES } from "@/lib/types";
import { cn } from "cn";

export function DrinkDialog({
  open,
  draftMood,
  recentLocations,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  draftMood: Mood | null;
  recentLocations: string[];
  onOpenChange: (open: boolean) => void;
  onSave: (input: { mood: Mood | null; drinkType: DrinkType; drinkLabel: string; location: string }) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        {open && (
          <DrinkForm
            draftMood={draftMood}
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
  recentLocations,
  onSave,
}: {
  draftMood: Mood | null;
  recentLocations: string[];
  onSave: (input: { mood: Mood | null; drinkType: DrinkType; drinkLabel: string; location: string }) => void;
}) {
  const [drinkType, setDrinkType] = useState<DrinkType>("啤酒");
  const [drinkLabel, setDrinkLabel] = useState("");
  const [location, setLocation] = useState("");
  const [mood, setMood] = useState<Mood | null>(draftMood);

  return (
    <>
      <DialogHeader>
        <DialogTitle>记一杯</DialogTitle>
        <DialogDescription>种类要选，心情和地点随便，不选也能记下。</DialogDescription>
      </DialogHeader>
      <form
        className="grid gap-4"
        onSubmit={(event) => {
          event.preventDefault();
          onSave({ mood, drinkType, drinkLabel, location });
        }}
      >
        <div className="grid grid-cols-3 gap-2">
          {DRINK_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              data-testid={`drink-type-${type}`}
              aria-pressed={drinkType === type}
              onClick={() => setDrinkType(type)}
              className={cn(
                "h-11 rounded-2xl text-sm font-medium",
                drinkType === type
                  ? "bg-[var(--skin-accent)] text-[var(--primary-foreground)]"
                  : "bg-white text-[var(--skin-ink)] ring-1 ring-black/5",
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
        <MoodPicker prefix="drink" label="这杯的心情" value={mood} onChange={setMood} />
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
        <Button type="submit" className="h-12! text-base" data-testid="drink-save">
          记下来
        </Button>
      </form>
    </>
  );
}
