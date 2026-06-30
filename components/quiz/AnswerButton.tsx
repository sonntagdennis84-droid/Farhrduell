"use client";

import type { AnswerOption } from "@/types/domain";
import { cn } from "@/lib/utils";

const colors: Record<AnswerOption, string> = {
  A: "bg-show-blue",
  B: "bg-show-orange",
  C: "bg-show-green",
  D: "bg-show-red"
};

export function AnswerButton({
  option,
  text,
  selected,
  disabled,
  className,
  size = "normal",
  onClick
}: {
  option: AnswerOption;
  text: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  size?: "normal" | "stage";
  onClick?: () => void;
}) {
  const stage = size === "stage";
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "stage-answer-button flex w-full items-center rounded-lg text-left text-white shadow-lg transition",
        stage ? "min-h-36 gap-6 px-6 py-6" : "min-h-20 gap-4 px-4 py-4",
        colors[option],
        selected && "ring-4 ring-white",
        disabled && "opacity-80",
        className
      )}
    >
      <span className={cn("stage-answer-option grid shrink-0 place-items-center rounded border border-white/40 bg-black/20 font-black", stage ? "h-24 w-24 text-6xl" : "h-10 w-10 text-xl")}>{option}</span>
      <span className={cn("stage-answer-text font-bold leading-snug", stage ? "text-3xl" : "text-lg")}>{text}</span>
    </button>
  );
}
