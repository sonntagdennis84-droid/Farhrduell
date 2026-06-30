"use client";

import { useEffect, useMemo } from "react";
import type { LeaderboardRow } from "@/types/domain";
import { ParticipantAvatar } from "@/components/quiz/ParticipantAvatar";
import { useFahrduellSound } from "@/hooks/useFahrduellSound";
import { useAdaptiveStage } from "@/hooks/useAdaptiveStage";
import { cn } from "@/lib/utils";

type PodiumRank = 1 | 2 | 3;

const medal = {
  gold: "\uD83E\uDD47",
  silver: "\uD83E\uDD48",
  bronze: "\uD83E\uDD49",
  crown: "\uD83D\uDC51"
};

const podiumConfig: Record<PodiumRank, { medal: string; label: string; tone: string; order: string; block: string; delay: string; avatar: "lg" | "xl" }> = {
  1: {
    medal: medal.gold,
    label: "Platz 1",
    tone: "border-show-gold/80 from-show-gold/95 via-yellow-300 to-yellow-700 text-show-navy",
    order: "md:order-2",
    block: "h-[15rem] md:h-[21rem]",
    delay: "finale-delay-1",
    avatar: "xl"
  },
  2: {
    medal: medal.silver,
    label: "Platz 2",
    tone: "border-white/70 from-slate-100 via-slate-300 to-slate-600 text-show-navy",
    order: "md:order-1",
    block: "h-[11rem] md:h-[15rem]",
    delay: "finale-delay-2",
    avatar: "lg"
  },
  3: {
    medal: medal.bronze,
    label: "Platz 3",
    tone: "border-orange-300/70 from-orange-300 via-orange-500 to-orange-800 text-show-navy",
    order: "md:order-3",
    block: "h-[10rem] md:h-[13rem]",
    delay: "finale-delay-3",
    avatar: "lg"
  }
};

function ConfettiField({ intense }: { intense: boolean }) {
  const pieces = intense ? 120 : 86;
  const colors = ["#FACC15", "#E5E7EB", "#C9782B", "#EF4444", "#2563EB"];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: pieces }).map((_, index) => {
        const size = 5 + (index % 5) * 2;
        return (
          <span
            aria-hidden
            className="finale-confetti absolute -top-10 rounded-sm"
            key={index}
            style={{
              left: `${(index * 41) % 100}%`,
              width: `${size}px`,
              height: `${size + (index % 3) * 5}px`,
              backgroundColor: colors[index % colors.length],
              animationDelay: `${(index % 28) * 90}ms`,
              animationDuration: `${3600 + (index % 12) * 150}ms`,
              transform: `rotate(${index * 19}deg)`
            }}
          />
        );
      })}
    </div>
  );
}

function PodiumPlace({ row }: { row: LeaderboardRow }) {
  const rank = row.rank as PodiumRank;
  const config = podiumConfig[rank];
  if (!config) return null;

  return (
    <div className={cn("finale-podium-place flex flex-col items-center justify-end", config.order, config.delay)}>
      <div className={cn("finale-winner-card relative z-10 mb-4 w-full max-w-sm rounded-lg border border-white/15 bg-show-panel/92 p-4 text-center shadow-2xl", rank === 1 && "finale-winner-glow")}>
        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl">{config.medal}</div>
        <div className="mt-7 flex justify-center">
          <ParticipantAvatar avatarId={row.avatarId} emoji={row.emoji} label={row.displayName} size={config.avatar} priority={rank === 1} />
        </div>
        <p className="mt-3 text-xs font-black uppercase tracking-widest text-show-gold">{config.label}</p>
        <h3 className="winner-podium-name mt-1 truncate text-3xl font-black text-white">{row.displayName}</h3>
        {row.team && (
          <p className="mt-2 inline-flex items-center gap-2 rounded border border-white/10 bg-white/5 px-2 py-1 text-xs font-black text-white/70">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: row.team.color ?? "#FACC15" }} />
            {row.team.name}
          </p>
        )}
        <p className="mt-3 text-2xl font-black text-show-gold">{row.totalPoints.toLocaleString("de-DE")} Punkte</p>
      </div>
      <div className={cn("finale-podium-block relative w-full rounded-t-2xl border bg-gradient-to-br shadow-[0_26px_55px_rgba(0,0,0,0.45)]", config.tone, config.block)}>
        <div className="absolute inset-x-4 top-4 h-10 rounded-full bg-white/35 blur-md" />
        <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-t-[2rem] bg-black/18" />
        <div className="relative grid h-full place-items-center text-[clamp(4rem,8vw,9rem)] font-black drop-shadow-lg">{rank === 1 ? medal.crown : rank}</div>
      </div>
    </div>
  );
}

export function WinnerPodium({ rows, title = "Gl\u00fcckwunsch!", subtitle = "Hier sind die Gewinner." }: { rows: LeaderboardRow[]; title?: string; subtitle?: string }) {
  const { playSound } = useFahrduellSound("results");
  const adaptive = useAdaptiveStage("fahrduell-results-stage-mode");
  const topRows = useMemo(() => rows.filter((row) => row.rank <= 3), [rows]);
  const ordered = useMemo(() => [topRows.find((row) => row.rank === 2), topRows.find((row) => row.rank === 1), topRows.find((row) => row.rank === 3)].filter(Boolean) as LeaderboardRow[], [topRows]);

  useEffect(() => {
    void playSound("winner");
    const musicTimer = window.setTimeout(() => void playSound("victory-music"), 650);
    const confettiTimer = window.setTimeout(() => void playSound("confetti"), 4700);
    return () => {
      window.clearTimeout(musicTimer);
      window.clearTimeout(confettiTimer);
    };
  }, [playSound]);

  return (
    <section className={cn("finale-stage relative overflow-hidden rounded-lg border border-show-gold/30 bg-[#050914] p-5 shadow-glow", adaptive.className)}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(246,180,0,0.28),transparent_28rem),linear-gradient(180deg,rgba(0,0,0,0.22),rgba(0,0,0,0.7))]" />
      <div className="finale-spotlight finale-spotlight-left" />
      <div className="finale-spotlight finale-spotlight-right" />
      <div className="finale-gold-shimmer" />
      <ConfettiField intense={adaptive.stageActive} />

      <div className="relative z-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.28em] text-show-gold">Showtime Finale</p>
            <h2 className="winner-podium-title mt-2 text-4xl font-black text-white">{title}</h2>
            <p className="mt-1 text-white/65">{subtitle}</p>
          </div>
          <button className={adaptive.manualStage ? "rounded border border-show-gold bg-show-gold px-4 py-2 text-sm font-black text-show-navy" : "rounded border border-white/15 px-4 py-2 text-sm font-black text-white/75"} onClick={adaptive.toggleStage} type="button">
            Stage Mode
          </button>
        </div>

        <div className="mt-10 grid items-end gap-5 md:grid-cols-3">
          {ordered.length > 0 ? ordered.map((row) => <PodiumPlace key={row.id} row={row} />) : <p className="text-white/60">Noch keine Teilnehmer im Ergebnis.</p>}
        </div>
      </div>
    </section>
  );
}
