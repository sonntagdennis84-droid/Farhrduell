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
  onClick
}: {
  option: AnswerOption;
  text: string;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-20 w-full items-center gap-4 rounded-lg px-4 py-4 text-left text-white shadow-lg transition",
        colors[option],
        selected && "ring-4 ring-white",
        disabled && "opacity-80",
        className
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded border border-white/40 bg-black/20 text-xl font-black">{option}</span>
      <span className="text-lg font-bold leading-snug">{text}</span>
    </button>
  );
}
