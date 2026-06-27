import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function PrimaryButton({ className, children, ...props }: PropsWithChildren<ButtonHTMLAttributes<HTMLButtonElement>>) {
  return (
    <button
      className={cn(
        "inline-flex min-h-11 items-center justify-center rounded border border-show-gold/60 bg-show-gold px-5 py-2.5 font-bold text-show-navy shadow-glow transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
