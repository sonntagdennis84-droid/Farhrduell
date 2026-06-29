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

export type FahrduellSoundName = keyof typeof soundMap;

export function useFahrduellSound(storageSuffix = "global") {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const audioCache = useRef(new Map<string, HTMLAudioElement>());

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

  const playSound = useCallback(
    async (name: FahrduellSoundName) => {
      if (!soundEnabled || typeof window === "undefined") return;
      const src = soundMap[name];
      if (!src) return;

      try {
        const cached = audioCache.current.get(src) ?? new Audio(src);
        audioCache.current.set(src, cached);
        cached.currentTime = 0;
        await cached.play().catch(() => undefined);
      } catch {
        // sound is optional and must never break the app
      }
    },
    [soundEnabled]
  );

  const toggleSound = useCallback(() => setSoundEnabled((value) => !value), []);

  return useMemo(
    () => ({
      soundEnabled,
      playSound,
      toggleSound
    }),
    [playSound, soundEnabled, toggleSound]
  );
}
