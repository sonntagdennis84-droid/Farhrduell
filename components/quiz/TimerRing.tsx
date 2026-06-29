"use client";

import { cn } from "@/lib/utils";

export function TimerRing({ secondsLeft, totalSeconds, size = "normal" }: { secondsLeft: number; totalSeconds: number; size?: "normal" | "stage" }) {
  const percent = Math.max(0, Math.min(100, (secondsLeft / Math.max(totalSeconds, 1)) * 100));
  const stage = size === "stage";
  const urgent = secondsLeft > 0 && secondsLeft <= 5;
  return (
    <div
      className={cn(
        "grid place-items-center rounded-full font-black text-white transition-all duration-300",
        stage ? "h-32 w-32 text-4xl" : "h-20 w-20 text-xl",
        urgent && "scale-[1.04] animate-pulse shadow-[0_0_28px_rgba(246,76,60,0.45)]"
      )}
      style={{ background: `conic-gradient(${urgent ? "#F64C3C" : "#F6B400"} ${percent}%, rgba(255,255,255,0.14) 0)` }}
    >
      <div className={cn("grid place-items-center rounded-full bg-show-navy transition-colors duration-300", stage ? "h-24 w-24" : "h-16 w-16", urgent && "border border-show-red/70 text-show-red")}>
        {secondsLeft}
      </div>
    </div>
  );
}
