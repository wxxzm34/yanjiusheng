"use client";

import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="px-4 pt-16">
      <div className="paper-card rounded-3xl p-6" role="alert">
        <p className="font-display text-3xl">页面绊了一下</p>
        <p className="mt-2 text-sm leading-6 opacity-80">记录还在浏览器里。再试一次通常就好。</p>
        <Button type="button" className="mt-4 h-11!" onClick={reset}>
          再试一次
        </Button>
      </div>
    </div>
  );
}
