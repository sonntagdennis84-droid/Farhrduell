"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const STORAGE_KEY = "fahrduell:sound-enabled";

const soundMap = {
  "quiz-start": "/sounds/quiz-start.mp3",
  "question-start": "/sounds/question-start.mp3",
  "countdown-warning": "/sounds/countdown-warning.mp3",
  "answer-submitted": "/sounds/answer-submitted.mp3",
  "answer-correct": "/sounds/answer-correct.mp3",
  "answer-wrong": "/sounds/answer-wrong.mp3",
  leaderboard: "/sounds/leaderboard.mp3",
  winner: "/sounds/winner.mp3"
} as const;

type ToneStep = { frequency: number; durationMs: number; gain?: number; type?: OscillatorType };

const fallbackPatterns: Record<keyof typeof soundMap, ToneStep[]> = {
  "quiz-start": [
    { frequency: 440, durationMs: 120, gain: 0.045 },
    { frequency: 660, durationMs: 150, gain: 0.05 }
  ],
  "question-start": [
    { frequency: 520, durationMs: 90, gain: 0.045 },
    { frequency: 700, durationMs: 120, gain: 0.05 }
  ],
  "countdown-warning": [{ frequency: 880, durationMs: 110, gain: 0.04, type: "square" }],
  "answer-submitted": [{ frequency: 620, durationMs: 70, gain: 0.03 }],
  "answer-correct": [
    { frequency: 660, durationMs: 90, gain: 0.04 },
    { frequency: 880, durationMs: 120, gain: 0.045 }
  ],
  "answer-wrong": [{ frequency: 240, durationMs: 180, gain: 0.04, type: "sawtooth" }],
  leaderboard: [
    { frequency: 523, durationMs: 80, gain: 0.035 },
    { frequency: 659, durationMs: 80, gain: 0.04 },
    { frequency: 784, durationMs: 120, gain: 0.045 }
  ],
  winner: [
    { frequency: 523, durationMs: 100, gain: 0.04 },
    { frequency: 659, durationMs: 100, gain: 0.045 },
    { frequency: 784, durationMs: 140, gain: 0.05 },
    { frequency: 1047, durationMs: 180, gain: 0.055 }
  ]
};

export type FahrduellSoundName = keyof typeof soundMap;

function getAudioContext() {
  if (typeof window === "undefined") return null;
  const AudioContextCtor = window.AudioContext || (window as Window & typeof globalThis & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioContextCtor) return null;
  return new AudioContextCtor();
}

export function useFahrduellSound(storageSuffix = "global") {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCache = useRef(new Map<string, HTMLAudioElement>());
  const audioContextRef = useRef<AudioContext | null>(null);
  const unlockedRef = useRef(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`${STORAGE_KEY}:${storageSuffix}`);
      if (saved === "false") setSoundEnabled(false);
    } catch {
      // ignore local storage issues
    }
  }, [storageSuffix]);

  useEffect(() => {
    try {
      window.localStorage.setItem(`${STORAGE_KEY}:${storageSuffix}`, String(soundEnabled));
    } catch {
      // ignore local storage issues
    }
  }, [soundEnabled, storageSuffix]);

  const unlockAudio = useCallback(async () => {
    if (typeof window === "undefined" || unlockedRef.current) return;
    try {
      const context = audioContextRef.current ?? getAudioContext();
      audioContextRef.current = context;
      if (context?.state === "suspended") await context.resume();
      unlockedRef.current = true;
    } catch {
      // browser audio remains optional
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const handler = () => {
      void unlockAudio();
    };
    window.addEventListener("pointerdown", handler, { passive: true });
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("pointerdown", handler);
      window.removeEventListener("keydown", handler);
    };
  }, [unlockAudio]);

  const playFallbackTone = useCallback(async (name: FahrduellSoundName) => {
    try {
      const context = audioContextRef.current ?? getAudioContext();
      audioContextRef.current = context;
      if (!context) return;
      if (context.state === "suspended") await context.resume();

      let cursor = context.currentTime;
      for (const step of fallbackPatterns[name]) {
        const oscillator = context.createOscillator();
        const gain = context.createGain();
        oscillator.type = step.type ?? "sine";
        oscillator.frequency.value = step.frequency;
        gain.gain.setValueAtTime(step.gain ?? 0.04, cursor);
        gain.gain.exponentialRampToValueAtTime(0.001, cursor + step.durationMs / 1000);
        oscillator.connect(gain);
        gain.connect(context.destination);
        oscillator.start(cursor);
        oscillator.stop(cursor + step.durationMs / 1000);
        cursor += step.durationMs / 1000 + 0.03;
      }
    } catch {
      // fallback is best-effort only
    }
  }, []);

  const playSound = useCallback(
    async (name: FahrduellSoundName) => {
      if (!soundEnabled || typeof window === "undefined") return;
      const src = soundMap[name];
      if (!src) return;

      try {
        await unlockAudio();
        const cached = audioCache.current.get(src) ?? new Audio(src);
        audioCache.current.set(src, cached);
        cached.currentTime = 0;
        await cached.play();
      } catch {
        await playFallbackTone(name);
      }
    },
    [playFallbackTone, soundEnabled, unlockAudio]
  );

  const toggleSound = useCallback(() => {
    setSoundEnabled((value) => !value);
    void unlockAudio();
  }, [unlockAudio]);

  return useMemo(
    () => ({
      soundEnabled,
      playSound,
      toggleSound,
      unlockAudio
    }),
    [playSound, soundEnabled, toggleSound, unlockAudio]
  );
}
