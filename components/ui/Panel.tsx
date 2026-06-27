import type { PropsWithChildren } from "react";
import { cn } from "@/lib/utils";

export function Panel({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <section className={cn("rounded-lg border border-white/10 bg-show-panel/90 p-5 shadow-xl", className)}>{children}</section>;
}
