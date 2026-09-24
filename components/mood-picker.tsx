"use client";

import type { Mood } from "@/lib/types";
import { MOODS } from "@/lib/types";
import { cn } from "cn";

const faces: Record<Mood, string> = {
  无聊: "－＿－",
  开心: "＾＿＾",
  难过: "Ｔ＿Ｔ",
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
                "h-12 rounded-2xl border text-sm font-medium transition active:translate-y-px",
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
