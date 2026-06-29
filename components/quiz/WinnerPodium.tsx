"use client";

import { useEffect } from "react";
import type { LeaderboardRow } from "@/types/domain";
import { useFahrduellSound } from "@/hooks/useFahrduellSound";
import { cn } from "@/lib/utils";

const podiumConfig = {
  1: { label: "1", tone: "from-show-gold/35 to-show-gold/5 border-show-gold", height: "min-h-52", medal: "🥇" },
  2: { label: "2", tone: "from-slate-200/25 to-white/5 border-white/35", height: "min-h-40", medal: "🥈" },
  3: { label: "3", tone: "from-orange-400/25 to-orange-900/10 border-orange-300/45", height: "min-h-36", medal: "🥉" }
} as const;

function PodiumPlace({ row }: { row: LeaderboardRow }) {
  const config = podiumConfig[row.rank as 1 | 2 | 3];
  if (!config) return null;

  return (
    <div className={cn("flex flex-col justify-end rounded-lg border bg-gradient-to-b p-5 text-center shadow-2xl transition duration-500 animate-in fade-in", config.tone, config.height, row.rank === 1 && "md:order-2 md:-mt-8", row.rank === 2 && "md:order-1", row.rank === 3 && "md:order-3")}>
      <div className="text-5xl">{config.medal}</div>
      <div className="mt-3 text-5xl font-black text-show-gold">#{config.label}</div>
      <div className="mt-4 text-5xl">{row.emoji ?? "🚗"}</div>
      <div className="mt-3 text-2xl font-black text-white">{row.displayName}</div>
      <div className="mt-2 text-xl font-black text-show-gold">{row.totalPoints} Punkte</div>
      <div className="mt-1 text-sm font-semibold text-white/60">{row.correctAnswers} richtig</div>
    </div>
  );
}

export function WinnerPodium({ rows }: { rows: LeaderboardRow[] }) {
  const { playSound } = useFahrduellSound("results");
  const topRows = rows.slice(0, 3);
  const ordered = [topRows.find((row) => row.rank === 2), topRows.find((row) => row.rank === 1), topRows.find((row) => row.rank === 3)].filter(Boolean) as LeaderboardRow[];

  useEffect(() => {
    void playSound("winner");
  }, [playSound]);

  return (
    <section className="relative overflow-hidden rounded-lg border border-show-gold/30 bg-show-panel/90 p-5 shadow-glow">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {Array.from({ length: 28 }).map((_, index) => (
          <span
            className="absolute h-2 w-2 animate-bounce rounded-sm bg-show-gold opacity-80"
            key={index}
            style={{
              left: `${(index * 37) % 100}%`,
              top: `${(index * 17) % 58}%`,
              animationDelay: `${(index % 7) * 120}ms`,
              animationDuration: `${900 + (index % 5) * 160}ms`,
              backgroundColor: ["#FACC15", "#E5E7EB", "#F97316", "#22C55E", "#2563EB"][index % 5]
            }}
          />
        ))}
      </div>
      <div className="relative">
        <p className="text-sm font-black uppercase text-show-gold">Siegerpodium</p>
        <h2 className="mt-2 text-3xl font-black text-white">Applaus für die Top 3</h2>
        <div className="mt-8 grid items-end gap-4 md:grid-cols-3">
          {ordered.length > 0 ? ordered.map((row) => <PodiumPlace key={row.id} row={row} />) : <p className="text-white/60">Noch keine Teilnehmer im Ergebnis.</p>}
        </div>
      </div>
    </section>
  );
}
