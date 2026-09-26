"use client";

import { MAX_COUNT, normalizeCount } from "@/lib/quantity";

export function QuantityStepper({
  value,
  onChange,
  testId,
}: {
  value: string;
  onChange: (value: string) => void;
  testId: string;
}) {
  const current = normalizeCount(value);

  return (
    <div className="flex items-center rounded-full bg-white/80 p-1 ring-1 ring-black/5">
      <button
        type="button"
        aria-label="减少"
        data-testid={`${testId}-minus`}
        className="size-10 rounded-full text-lg leading-none disabled:opacity-35"
        disabled={current <= 1}
        onClick={() => onChange(String(Math.max(1, current - 1)))}
      >
        －
      </button>
      <input
        aria-label="数量"
        inputMode="numeric"
        data-testid={`${testId}-input`}
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          if (next !== "" && !/^\d{1,3}$/.test(next)) return;
          onChange(next);
        }}
        onBlur={() => onChange(String(normalizeCount(value)))}
        className="h-10 w-12 bg-transparent text-center text-base font-medium outline-none"
      />
      <button
        type="button"
        aria-label="增加"
        data-testid={`${testId}-plus`}
        className="size-10 rounded-full text-lg leading-none disabled:opacity-35"
        disabled={current >= MAX_COUNT}
        onClick={() => onChange(String(Math.min(MAX_COUNT, current + 1)))}
      >
        ＋
      </button>
    </div>
  );
}
