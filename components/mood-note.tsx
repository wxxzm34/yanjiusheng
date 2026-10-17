"use client";

import { NOTE_LIMIT } from "@/lib/storage";

export function MoodNote({
  value,
  onChange,
  testId = "mood-note",
}: {
  value: string;
  onChange: (value: string) => void;
  testId?: string;
}) {
  return (
    <label className="mt-3 block">
      <span className="text-sm">心情感悟</span>
      <textarea
        data-testid={testId}
        maxLength={NOTE_LIMIT}
        value={value}
        placeholder="写一句，可以不写"
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 min-h-20 w-full resize-none rounded-2xl bg-white/80 px-3 py-2 text-sm leading-6"
      />
    </label>
  );
}
