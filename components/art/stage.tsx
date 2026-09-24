"use client";

import { useEffect, useRef } from "react";
import { DrinkProp, HeroFigure, LaserBeam, UserFigure } from "@/components/art/figures";
import { LASER_LINE, drinkLine } from "@/lib/copy";
import type { Skin } from "@/lib/packs";
import type { DrinkType } from "@/lib/types";

export type Gag =
  | null
  | { nonce: number; type: "smoke" }
  | { nonce: number; type: "drink"; drinkType: DrinkType; label: string };

export function CartoonStage({
  skin,
  gag,
  onSkip,
}: {
  skin: Skin;
  gag: Gag;
  onSkip: () => void;
}) {
  const onSkipRef = useRef(onSkip);

  useEffect(() => {
    onSkipRef.current = onSkip;
  }, [onSkip]);

  useEffect(() => {
    if (!gag) return;
    const delay = gag.type === "smoke" ? 3600 : 2300;
    const timer = window.setTimeout(() => onSkipRef.current(), delay);
    return () => window.clearTimeout(timer);
  }, [gag]);

  const drink = gag?.type === "drink";
  const smoke = gag?.type === "smoke";

  return (
    <div
      className="relative h-[300px]"
      data-testid="cartoon-stage"
      data-skin={skin.id}
      data-pose={skin.pose}
    >
      {smoke && (
        <button
          type="button"
          onClick={onSkip}
          className="pointer-events-auto absolute top-2 right-2 z-30 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[var(--skin-ink)] shadow"
        >
          跳过
        </button>
      )}
      {drink && (
        <button
          type="button"
          onClick={onSkip}
          className="pointer-events-auto absolute top-2 right-2 z-30 rounded-full bg-white/90 px-3 py-1 text-sm font-medium text-[var(--skin-ink)] shadow"
        >
          跳过
        </button>
      )}

      {smoke && (
        <div className="gag-bubble pointer-events-none absolute top-2 right-16 left-2 z-20 rounded-2xl bg-white px-3 py-2 text-center text-[15px] leading-snug font-medium text-[var(--skin-ink)] shadow-lg">
          <p data-testid="laser-line">{LASER_LINE}</p>
        </div>
      )}
      {drink && gag.type === "drink" && (
        <div className="gag-bubble pointer-events-none absolute top-2 right-16 left-2 z-20 rounded-2xl bg-white/95 px-3 py-2 text-center text-[15px] leading-snug font-medium text-[var(--skin-ink)] shadow">
          <p data-testid="drink-line">{drinkLine(gag.drinkType, gag.label)}</p>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between px-1">
        {!drink && <HeroFigure skin={skin} firing={smoke} />}
        {drink && gag.type === "drink" ? (
          <div className="flex flex-1 items-end justify-center gap-2 pb-1">
            <DrinkProp type={gag.drinkType} label={gag.label} />
            <UserFigure className="gag-user" />
          </div>
        ) : (
          <>
            <div className="mb-16 w-[28%] min-w-16 flex-1">
              {smoke && <LaserBeam skin={skin} />}
            </div>
            <UserFigure hit={smoke} />
          </>
        )}
      </div>
    </div>
  );
}
