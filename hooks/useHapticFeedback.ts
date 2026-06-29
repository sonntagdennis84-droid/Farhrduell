"use client";

import { useCallback } from "react";

type HapticPattern = "light" | "success" | "warning";

const patterns: Record<HapticPattern, number | number[]> = {
  light: 18,
  success: [20, 30, 35],
  warning: [35, 40, 35]
};

export function useHapticFeedback() {
  return useCallback((pattern: HapticPattern = "light") => {
    try {
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        navigator.vibrate(patterns[pattern]);
      }
    } catch {
      // Haptic feedback is optional and should never interrupt moderation.
    }
  }, []);
}
