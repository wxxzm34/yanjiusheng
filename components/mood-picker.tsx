"use client";

import type { Mood } from "@/lib/types";
import { MOODS } from "@/lib/types";
import { cn } from "cn";

const faces: Record<Mood, string> = {
  独酌明月: "月",
  会友欢饮: "友",
  闲坐静思: "静",
  乱我心忧: "忧",
};

export function MoodPicker({
  value,
  onChange,
  prefix,
  label,
}: {
  value: Mood | null;
  onChange: (mood: Mood | null) => void;
  prefix: string;
  label: string;
}) {
  return (
    <div>
      <p className="mb-2 text-sm text-[var(--skin-ink)]">{label}</p>
      <div className="grid grid-cols-2 gap-2">
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
                "h-14 rounded-2xl border px-1 text-sm font-medium transition active:translate-y-px",
                selected
                  ? "border-transparent bg-[var(--skin-accent)] text-[var(--primary-foreground)] shadow"
                  : "border-black/5 bg-white/80 text-[var(--skin-ink)]",
              )}
            >
              <span className="block text-[10px] leading-none opacity-80">{faces[mood]}</span>
              {mood}
            </button>
          );
        })}
      </div>
    </div>
  );
}
