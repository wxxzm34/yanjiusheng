"use client";

import type { Mood } from "@/lib/types";
import { MOODS, MOOD_EMOJI } from "@/lib/types";
import { cn } from "cn";

export function MoodPicker({
  value,
  onChange,
  prefix,
  label,
}: {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
  prefix: string;
  label?: string;
}) {
  return (
    <div>
      {label ? <p className="mb-2 text-sm text-[var(--skin-ink)]">{label}</p> : null}
      <div className="grid grid-cols-3 gap-2">
        {MOODS.map((mood) => {
          const selected = value === mood;
          return (
            <button
              key={mood}
              type="button"
              data-testid={`${prefix}-mood-${mood}`}
              aria-pressed={selected}
              onClick={() => onChange(selected ? null : mood)}
              className={cn(
                "flex h-16 flex-col items-center justify-center rounded-2xl border text-sm font-medium transition active:translate-y-px",
                selected
                  ? "border-transparent bg-[var(--skin-accent)] text-[var(--primary-foreground)] shadow"
                  : "border-black/5 bg-white/80 text-[#2b2118]",
              )}
            >
              <span className="text-2xl leading-none">{MOOD_EMOJI[mood]}</span>
              <span className="mt-1 text-xs leading-none">{mood}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
