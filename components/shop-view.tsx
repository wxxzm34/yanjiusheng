"use client";

import { BackgroundScene } from "@/components/art/backgrounds";
import { HeroFigure } from "@/components/art/figures";
import { useApp } from "@/components/app-provider";
import { DataActions } from "@/components/data-actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { BACKGROUNDS, SKINS } from "@/lib/packs";

export function ShopView() {
  const { skin, background, unlockedIds, pendingPackId, downloadPack, applySkin, applyBackground } = useApp();

  return (
    <div className="px-4 pt-5">
      <header className="paper-card mb-4 rounded-3xl px-4 py-3">
        <h1 className="font-display text-4xl">装扮</h1>
        <p className="mt-1 text-sm leading-6 opacity-80">
          下载只存在这台手机里，不用付钱。换皮肤会改激光小英雄和按钮颜色，换背景会改整页的景。
        </p>
        <p className="mt-2 text-xs opacity-70" data-testid="shop-active">
          正在用 {skin.name} · {background.name}
        </p>
      </header>

      <section>
        <h2 className="mb-2 font-medium">背景</h2>
        <div className="grid grid-cols-2 gap-3">
          {BACKGROUNDS.map((pack) => {
            const unlocked = unlockedIds.includes(pack.id);
            const active = background.id === pack.id;
            return (
              <article key={pack.id} className="paper-card overflow-hidden rounded-3xl" data-testid={`pack-${pack.id}`}>
                <div className="h-28">
                  <BackgroundScene motif={pack.motif} />
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
                      onApply={() => applyBackground(pack.id)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-2 font-medium">皮肤</h2>
        <div className="grid gap-3">
          {SKINS.map((pack) => {
            const unlocked = unlockedIds.includes(pack.id);
            const active = skin.id === pack.id;
            return (
              <article key={pack.id} className="paper-card overflow-hidden rounded-3xl" data-testid={`pack-${pack.id}`}>
                <div className="flex items-end justify-center" style={{ background: pack.accentSoft, height: 132 }}>
                  <HeroFigure skin={pack} className="h-32! w-28" />
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
                      onApply={() => applySkin(pack.id)}
                    />
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <Separator className="my-5 bg-black/10" />

      <section className="paper-card mb-4 rounded-3xl p-4">
        <h2 className="font-medium">小本本</h2>
        <p className="mt-1 text-sm leading-6 opacity-80">示例是假的几天，清空只删记录，装扮还在。</p>
        <div className="mt-3">
          <DataActions />
        </div>
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
      className="h-10! w-full bg-white/80"
      data-testid={`pack-action-${id}`}
      onClick={onApply}
    >
      使用
    </Button>
  );
}
