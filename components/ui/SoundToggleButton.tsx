"use client";

import { Volume2, VolumeX } from "lucide-react";

export function SoundToggleButton({ soundEnabled, onToggle }: { soundEnabled: boolean; onToggle: () => void }) {
  const Icon = soundEnabled ? Volume2 : VolumeX;
  return (
    <button
      className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-bold text-white/80 hover:border-show-gold hover:text-show-gold"
      onClick={onToggle}
      type="button"
    >
      <Icon size={18} />
      <span>{soundEnabled ? "Sound an" : "Sound aus"}</span>
    </button>
  );
}
