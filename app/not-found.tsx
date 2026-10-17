"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="px-4 pt-16">
      <div className="paper-card rounded-3xl p-6">
        <p className="font-display text-3xl">这条小路没有页面</p>
        <p className="mt-2 text-sm leading-6 opacity-80">回到今天就好。</p>
        <Button type="button" className="mt-4 h-11!" onClick={() => router.push("/")}>
          回今天
        </Button>
      </div>
    </div>
  );
}
