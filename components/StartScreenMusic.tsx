"use client";

import { useEffect, useRef, useState } from "react";

const motif = [
  { note: 0, duration: 0.22 },
  { note: 4, duration: 0.22 },
  { note: 7, duration: 0.22 },
  { note: 12, duration: 0.32 },
  { note: 7, duration: 0.2 },
  { note: 4, duration: 0.2 },
  { note: 9, duration: 0.26 },
  { note: 12, duration: 0.32 }
];

function playLoop(context: AudioContext) {
  const startAt = context.currentTime + 0.05;
  const gain = context.createGain();
  gain.gain.value = 0.08;
  gain.connect(context.destination);

  let cursor = startAt;
  for (let repeat = 0; repeat < 4; repeat += 1) {
    for (const step of motif) {
      const oscillator = context.createOscillator();
      const noteGain = context.createGain();
      oscillator.type = repeat % 2 === 0 ? "triangle" : "sawtooth";
      oscillator.frequency.value = 220 * 2 ** (step.note / 12);
      noteGain.gain.setValueAtTime(0.001, cursor);
      noteGain.gain.exponentialRampToValueAtTime(0.18, cursor + 0.02);
      noteGain.gain.exponentialRampToValueAtTime(0.001, cursor + step.duration);
      oscillator.connect(noteGain);
      noteGain.connect(gain);
      oscillator.start(cursor);
      oscillator.stop(cursor + step.duration + 0.04);
      cursor += step.duration;
    }
    cursor += 0.08;
  }

  return { gain, stopAt: cursor };
}

export function StartScreenMusic() {
  const contextRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      gainRef.current?.disconnect();
      contextRef.current?.close().catch(() => {});
    };
  }, []);

  async function start() {
    if (playing) return;
    const context = contextRef.current ?? new AudioContext();
    contextRef.current = context;
    if (context.state === "suspended") await context.resume();
    const { gain, stopAt } = playLoop(context);
    gainRef.current?.disconnect();
    gainRef.current = gain;
    setPlaying(true);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = window.setTimeout(() => {
      gain.disconnect();
      if (gainRef.current === gain) gainRef.current = null;
      setPlaying(false);
    }, Math.max((stopAt - context.currentTime) * 1000, 1000));
  }

  function stop() {
    gainRef.current?.disconnect();
    gainRef.current = null;
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    setPlaying(false);
  }

  return (
    <button className="inline-flex min-h-11 items-center justify-center rounded border border-white/20 bg-white/5 px-5 py-3 font-bold text-white hover:border-show-gold hover:text-show-gold" onClick={playing ? stop : start} type="button">
      {playing ? "Musik aus" : "Startmusik abspielen"}
    </button>
  );
}
