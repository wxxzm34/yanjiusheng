"use client";

import { MAX_COUNT, normalizeAmount } from "@/lib/quantity";

export function QuantityStepper({
  value,
  onChange,
  testId,
  max = MAX_COUNT,
}: {
  value: string;
  onChange: (value: string) => void;
  testId: string;
  max?: number;
}) {
  const current = normalizeAmount(value, max);

  return (
    <div className="flex items-center rounded-full bg-white/80 p-1 text-[#2b2118] ring-1 ring-black/5">
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
        onBlur={() => onChange(String(normalizeAmount(value, max)))}
        className="h-10 w-12 bg-transparent text-center text-base font-medium outline-none"
      />
      <button
        type="button"
        aria-label="增加"
        data-testid={`${testId}-plus`}
        className="size-10 rounded-full text-lg leading-none disabled:opacity-35"
        disabled={current >= max}
        onClick={() => onChange(String(Math.min(max, current + 1)))}
      >
        ＋
      </button>
    </div>
  );
}
