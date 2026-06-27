"use client";

import { cn } from "@/lib/utils";

export function TimerRing({ secondsLeft, totalSeconds, size = "normal" }: { secondsLeft: number; totalSeconds: number; size?: "normal" | "stage" }) {
  const percent = Math.max(0, Math.min(100, (secondsLeft / Math.max(totalSeconds, 1)) * 100));
  const stage = size === "stage";
  return (
    <div
      className={cn("grid place-items-center rounded-full font-black text-white", stage ? "h-32 w-32 text-4xl" : "h-20 w-20 text-xl")}
      style={{ background: `conic-gradient(#F6B400 ${percent}%, rgba(255,255,255,0.14) 0)` }}
    >
      <div className={cn("grid place-items-center rounded-full bg-show-navy", stage ? "h-24 w-24" : "h-16 w-16")}>{secondsLeft}</div>
    </div>
  );
}
