"use client";

import { BackgroundScene } from "@/components/art/backgrounds";
import { HeroFigure } from "@/components/art/figures";
import { useApp } from "@/components/app-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OUTFITS } from "@/lib/packs";

export function ShopView() {
  const { skin, unlockedIds, pendingPackId, downloadPack, applyOutfit } = useApp();

  return (
    <div className="px-4 pt-5">
      <header className="paper-card mb-4 rounded-3xl px-4 py-3">
        <h1 className="font-display text-4xl">装扮</h1>
        <p className="mt-1 text-sm leading-6 opacity-80">
          下载只存在这台手机里，不用付钱。换一套会同时改颜色和背景。
        </p>
        <p className="mt-2 text-xs opacity-70" data-testid="shop-active">
          正在用 {skin.name}
        </p>
      </header>

      <section className="grid gap-3">
        {OUTFITS.map((pack) => {
          const unlocked = unlockedIds.includes(pack.id);
          const active = skin.id === pack.id;
          return (
            <article key={pack.id} className="paper-card overflow-hidden rounded-3xl" data-testid={`pack-${pack.id}`}>
              <div className="relative h-36">
                <BackgroundScene motif={pack.motif} />
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                  <HeroFigure skin={pack} className="h-32! w-28" />
                </div>
              </div>
              <div className="p-3">
                <h3 className="font-medium">{pack.name}</h3>
                <p className="mt-1 text-xs leading-5 opacity-75">{pack.blurb}</p>
                <div className="mt-2">
                  <PackButton
                    id={pack.id}
                    unlocked={unlocked}
                    active={active}
                    pending={pendingPackId === pack.id}
                    onDownload={() => downloadPack(pack.id)}
                    onApply={() => applyOutfit(pack.id)}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function PackButton({
  id,
  unlocked,
  active,
  pending,
  onDownload,
  onApply,
}: {
  id: string;
  unlocked: boolean;
  active: boolean;
  pending: boolean;
  onDownload: () => void;
  onApply: () => void;
}) {
  if (active) return <Badge data-testid={`pack-action-${id}`}>使用中</Badge>;
  if (!unlocked) {
    return (
      <Button type="button" className="h-10! w-full" data-testid={`pack-action-${id}`} disabled={pending} onClick={onDownload}>
        {pending ? "下载中…" : "下载"}
      </Button>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      className="h-10! w-full bg-white/80 text-[#2b2118]"
      data-testid={`pack-action-${id}`}
      onClick={onApply}
    >
      使用
    </Button>
  );
}
