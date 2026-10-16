"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useApp } from "@/components/app-provider";

export function DataActions({
  sample = true,
  clear = true,
}: {
  sample?: boolean;
  clear?: boolean;
}) {
  const { entries, loadSample, clearEntries } = useApp();
  const [confirmSample, setConfirmSample] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  function requestSample() {
    if (entries.length > 0) setConfirmSample(true);
    else loadSample();
  }

  return (
    <div className="flex flex-wrap gap-2">
      {sample && (
        <Button
          type="button"
          variant="outline"
          className="h-10! bg-white/80"
          data-testid="load-sample"
          onClick={requestSample}
        >
          试试
        </Button>
      )}
      {clear && (
        <Button
          type="button"
          variant="ghost"
          className="h-10!"
          data-testid="clear-entries"
          onClick={() => entries.length > 0 && setConfirmClear(true)}
          disabled={entries.length === 0}
        >
          清空记录
        </Button>
      )}

      <Dialog open={confirmSample} onOpenChange={setConfirmSample}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>换成示例？</DialogTitle>
            <DialogDescription>
              现在的记录会被这一小段示例替掉。之后可以随时清空。
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-10! flex-1" onClick={() => setConfirmSample(false)}>
              先留着
            </Button>
            <Button
              type="button"
              className="h-10! flex-1"
              onClick={() => {
                loadSample();
                setConfirmSample(false);
              }}
            >
              换上示例
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={confirmClear} onOpenChange={setConfirmClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>清空全部记录？</DialogTitle>
            <DialogDescription>烟和酒的条目都会删掉。皮肤和背景还会留着。</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="h-10! flex-1" onClick={() => setConfirmClear(false)}>
              留下
            </Button>
            <Button
              type="button"
              variant="destructive"
              className="h-10! flex-1"
              onClick={() => {
                clearEntries();
                setConfirmClear(false);
              }}
            >
              清空
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
