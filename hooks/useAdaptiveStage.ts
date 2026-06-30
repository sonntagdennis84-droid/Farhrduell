"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export type AdaptiveDevice = "smartphone" | "tablet" | "notebook" | "desktop" | "fullhd" | "wqhd" | "uhd";

function detectDevice(width: number, height: number, dpr: number): AdaptiveDevice {
  const longestSide = Math.max(width, height);
  const shortestSide = Math.min(width, height);
  const physicalWidth = width * Math.max(dpr, 1);

  if (shortestSide < 640) return "smartphone";
  if (shortestSide < 900 && longestSide < 1280) return "tablet";
  if (width < 1440) return "notebook";
  if (width < 1920) return "desktop";
  if (physicalWidth >= 7000 || width >= 3600) return "uhd";
  if (width >= 2500) return "wqhd";
  return "fullhd";
}

export function useAdaptiveStage(storageKey = "fahrduell-stage-mode") {
  const [device, setDevice] = useState<AdaptiveDevice>("desktop");
  const [manualStage, setManualStage] = useState(false);

  useEffect(() => {
    setManualStage(window.localStorage.getItem(storageKey) === "1");

    let frame = 0;
    const update = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        setDevice(detectDevice(window.innerWidth, window.innerHeight, window.devicePixelRatio || 1));
      });
    };

    update();
    window.addEventListener("resize", update, { passive: true });
    window.visualViewport?.addEventListener("resize", update);

    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("resize", update);
      window.visualViewport?.removeEventListener("resize", update);
    };
  }, [storageKey]);

  const toggleStage = useCallback(() => {
    setManualStage((current) => {
      const next = !current;
      window.localStorage.setItem(storageKey, next ? "1" : "0");
      return next;
    });
  }, [storageKey]);

  const automaticStage = device === "fullhd" || device === "wqhd" || device === "uhd";
  const stageActive = manualStage || automaticStage;

  return useMemo(
    () => ({
      device,
      automaticStage,
      manualStage,
      stageActive,
      className: `adaptive-shell adaptive-${device}${stageActive ? " adaptive-stage" : ""}`,
      toggleStage
    }),
    [automaticStage, device, manualStage, stageActive, toggleStage]
  );
}
