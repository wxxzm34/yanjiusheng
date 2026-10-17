"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { BackgroundScene } from "@/components/art/backgrounds";
import { useApp } from "@/components/app-provider";
import { ShareDialog } from "@/components/share-dialog";
import { Button } from "@/components/ui/button";
import { skinVars } from "@/lib/packs";
import { cn } from "cn";

const nav = [
  { href: "/", label: "今天" },
  { href: "/history", label: "记录" },
  { href: "/report", label: "报告" },
  { href: "/shop", label: "装扮" },
];

export function Shell({ children }: { children: ReactNode }) {
  const { ready, loadError, saveError, skin, background, reload, resetAll } = useApp();

  useEffect(() => {
    const root = document.documentElement;
    const vars = skinVars(skin);
    for (const [key, value] of Object.entries(vars)) root.style.setProperty(key, value);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", skin.accent);
  }, [skin]);

  if (!ready) return <Frame><BootScreen /></Frame>;
  if (loadError) {
    return (
      <Frame>
        <BootScreen
          title="记录打不开"
          body="浏览器里的记录读失败了。可以再读一次，或者清空后重来。"
          actions={
            <div className="flex gap-2">
              <Button type="button" className="h-11! flex-1" onClick={reload}>
                再读一次
              </Button>
              <Button type="button" variant="outline" className="h-11! flex-1" onClick={resetAll}>
                清空重来
              </Button>
            </div>
          }
        />
      </Frame>
    );
  }

  return (
    <div style={skinVars(skin)} className="min-h-dvh text-[var(--skin-ink)]">
      <div className="relative mx-auto min-h-dvh w-full max-w-[430px]">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <BackgroundScene motif={background.motif} />
        </div>
        <div className="relative z-10 pb-28">{children}</div>
      </div>
      {saveError && (
        <p
          role="alert"
          className="fixed top-3 left-1/2 z-40 w-[min(400px,calc(100%-1.5rem))] -translate-x-1/2 rounded-2xl bg-[#2b2118] px-4 py-2 text-center text-sm text-white"
        >
          {saveError}
        </p>
      )}
      <nav
        className="fixed bottom-0 left-1/2 z-30 w-full max-w-[430px] -translate-x-1/2 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]"
        style={skinVars(skin)}
      >
        <div className="grid grid-cols-4 rounded-full bg-[var(--skin-paper)]/95 p-1 shadow-lg ring-1 ring-black/10">
          <NavLinks />
        </div>
      </nav>
      <ShareDialog />
    </div>
  );
}

function NavLinks() {
  const pathname = usePathname();
  return (
    <>
      {nav.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            data-testid={`nav-${item.label}`}
            className={cn(
              "rounded-full py-2 text-center text-sm font-medium",
              active ? "bg-[var(--skin-accent)] text-[var(--primary-foreground)]" : "text-[var(--skin-ink)]",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </>
  );
}

function Frame({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh text-[#2b2118]">
      <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col justify-center px-6">{children}</div>
    </div>
  );
}

function BootScreen({
  title = "打开中…",
  body = "正在把今天的空白页铺好。",
  actions,
}: {
  title?: string;
  body?: string;
  actions?: ReactNode;
}) {
  return (
    <div role="status" className="paper-card rounded-3xl p-6">
      <p className="font-display text-3xl">{title}</p>
      <p className="mt-2 text-sm leading-6 opacity-80">{body}</p>
      <div className="mt-5 space-y-3">
        <div className="h-24 animate-pulse rounded-2xl bg-black/5" />
        <div className="h-12 animate-pulse rounded-2xl bg-black/5" />
        <div className="h-12 w-2/3 animate-pulse rounded-2xl bg-black/5" />
      </div>
      {actions && <div className="mt-5">{actions}</div>}
    </div>
  );
}
