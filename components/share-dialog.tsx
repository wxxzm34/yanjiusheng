"use client";

import { useEffect, useMemo, useState } from "react";
import { useApp } from "@/components/app-provider";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { BackgroundPack, Skin } from "@/lib/packs";
import { renderShareCard } from "@/lib/share-card";
import { filterMonth, filterToday, filterYear, shareText, summarize, type Summary } from "@/lib/stats";
import { formatFullDate, formatMonth } from "@/lib/time";
import type { Entry, ShareFocus, ShareTarget } from "@/lib/types";

export function ShareDialog() {
  const { share, closeShare, entries, skin, background } = useApp();
  return (
    <Dialog open={!!share} onOpenChange={(open) => !open && closeShare()}>
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle>分享</DialogTitle>
        </DialogHeader>
        {share && (
          <ShareBody
            key={`${share.focus}-${share.year}-${share.month}`}
            target={share}
            entries={entries}
            skin={skin}
            background={background}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

function ShareBody({
  target,
  entries,
  skin,
  background,
}: {
  target: ShareTarget;
  entries: Entry[];
  skin: Skin;
  background: BackgroundPack;
}) {
  const [openedAt] = useState(() => Date.now());
  const [focus, setFocus] = useState<ShareFocus>(target.focus);
  const [attempt, setAttempt] = useState(0);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";
  const scoped = useMemo(() => {
    if (focus === "today") return filterToday(entries, openedAt);
    if (focus === "month") return filterMonth(entries, target.year, target.month);
    return filterYear(entries, target.year);
  }, [entries, focus, openedAt, target.month, target.year]);
  const summary = useMemo(() => summarize(scoped), [scoped]);
  const title =
    focus === "today"
      ? `今天 · ${formatFullDate(openedAt)}`
      : focus === "month"
        ? formatMonth(target.year, target.month)
        : `${target.year}年`;
  const text = scoped.length > 0 ? shareText(title, summary) : "";
  const filename =
    focus === "today"
      ? "yanjiusheng-today.png"
      : focus === "month"
        ? `yanjiusheng-${target.year}-${String(target.month).padStart(2, "0")}.png`
        : `yanjiusheng-${target.year}.png`;

  return (
    <>
      <Tabs value={focus} onValueChange={(value) => setFocus(value as ShareFocus)}>
        <TabsList className="h-11! w-full">
          <TabsTrigger value="today" className="flex-1" data-testid="share-today">
            今天
          </TabsTrigger>
          <TabsTrigger value="month" className="flex-1" data-testid="share-month">
            {target.year}年{target.month}月
          </TabsTrigger>
          <TabsTrigger value="year" className="flex-1" data-testid="share-year">
            {target.year}年
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {scoped.length === 0 ? (
        <div className="rounded-2xl bg-[var(--skin-soft)] p-4" data-testid="share-empty">
          <p className="font-display text-2xl">这段还是空的</p>
        </div>
      ) : (
        <ReadyShare
          key={`${focus}-${attempt}`}
          title={title}
          summary={summary}
          skin={skin}
          background={background}
          text={text}
          filename={filename}
          canShare={canShare}
          onRetry={() => setAttempt((value) => value + 1)}
        />
      )}
      {scoped.length === 0 && (
        <Button type="button" className="h-11!" data-testid="share-copy" disabled>
          复制
        </Button>
      )}
    </>
  );
}

function ReadyShare({
  title,
  summary,
  skin,
  background,
  text,
  filename,
  canShare,
  onRetry,
}: {
  title: string;
  summary: Summary;
  skin: Skin;
  background: BackgroundPack;
  text: string;
  filename: string;
  canShare: boolean;
  onRetry: () => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancel = false;
    let url = "";
    renderShareCard({ title, summary, skin, background })
      .then((next) => {
        if (cancel) return;
        url = URL.createObjectURL(next);
        setBlob(next);
        setPreview(url);
      })
      .catch(() => {
        if (!cancel) setFailed(true);
      });
    return () => {
      cancel = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [background, skin, summary, title]);

  async function copyText() {
    try {
      await navigator.clipboard.writeText(text);
      setMessage("文字已复制");
    } catch {
      const area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "true");
      area.style.position = "fixed";
      area.style.left = "-9999px";
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand("copy");
      area.remove();
      setMessage(ok ? "文字已复制" : "没复制成，可以长按文字自己选");
    }
  }

  function download() {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
    setMessage("图片开始下载");
  }

  async function nativeShare() {
    try {
      const payload: ShareData = { title: "烟酒生", text };
      if (blob && navigator.canShare) {
        const file = new File([blob], filename, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) payload.files = [file];
      }
      await navigator.share(payload);
      setMessage("已交给系统分享");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      setMessage("系统分享没打开，可以改用复制或下载");
    }
  }

  return (
    <>
      {failed && (
        <div role="alert" className="rounded-2xl bg-white/80 p-4" data-testid="share-error">
          <p className="font-medium">分享卡没画出来</p>
          <p className="mt-1 text-sm opacity-80">文字还可以复制。图片可以再试一次。</p>
          <Button type="button" className="mt-3 h-10!" onClick={onRetry}>
            再试一次
          </Button>
        </div>
      )}
      {!failed && !preview && (
        <div role="status" className="rounded-2xl bg-white/80 p-4" data-testid="share-loading">
          <p>正在画分享卡…</p>
          <div className="mt-3 h-40 animate-pulse rounded-2xl bg-black/5" />
        </div>
      )}
      {preview && (
        // Blob previews are generated in the browser and are not a remote image.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="烟酒生分享卡" className="w-full rounded-2xl" data-testid="share-card" />
      )}
      <pre data-testid="share-text" className="rounded-2xl bg-white/80 p-3 font-sans text-sm leading-6 whitespace-pre-wrap">
        {text}
      </pre>
      {message && (
        <p role="status" className="text-sm" data-testid="share-message">
          {message}
        </p>
      )}
      <div className="grid gap-2">
        <Button type="button" className="h-11!" data-testid="share-copy" onClick={copyText}>
          复制
        </Button>
        <Button
          type="button"
          variant="outline"
          className="h-11! bg-white/80"
          data-testid="share-download"
          disabled={!blob}
          onClick={download}
        >
          保存图片
        </Button>
        {canShare && (
          <Button type="button" variant="outline" className="h-11! bg-white/80" data-testid="share-native" onClick={nativeShare}>
            系统分享
          </Button>
        )}
      </div>
    </>
  );
}
