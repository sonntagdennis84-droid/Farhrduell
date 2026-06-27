"use client";

export function TimerRing({ secondsLeft, totalSeconds }: { secondsLeft: number; totalSeconds: number }) {
  const percent = Math.max(0, Math.min(100, (secondsLeft / Math.max(totalSeconds, 1)) * 100));
  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full text-xl font-black text-white"
      style={{ background: `conic-gradient(#F6B400 ${percent}%, rgba(255,255,255,0.14) 0)` }}
    >
      <div className="grid h-16 w-16 place-items-center rounded-full bg-show-navy">{secondsLeft}</div>
    </div>
  );
}
