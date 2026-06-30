import type { Quiz } from "@/types/domain";

const coverPresets = [
  { match: ["technik", "fahrzeug", "motor", "kupplung"], icon: "🔧", color: "from-slate-700 via-zinc-800 to-show-navy" },
  { match: ["grundstoff", "verkehr", "vorfahrt", "zeichen"], icon: "🚦", color: "from-emerald-700 via-show-navy to-slate-950" },
  { match: ["recht", "regel", "pflicht"], icon: "⚖️", color: "from-blue-800 via-show-navy to-slate-950" },
  { match: ["disney", "zauber"], icon: "🏰", color: "from-indigo-700 via-show-navy to-amber-700" },
  { match: ["nintendo", "gaming", "spiel"], icon: "🎮", color: "from-red-700 via-show-navy to-blue-800" },
  { match: ["privat"], icon: "⭐", color: "from-amber-600 via-show-navy to-slate-950" }
];

const fallback = { icon: "🏆", color: "from-show-blue via-show-navy to-slate-950" };

export function quizDisplay(quiz: Pick<Quiz, "title" | "category">) {
  const haystack = `${quiz.title} ${quiz.category?.name ?? ""}`.toLowerCase();
  return coverPresets.find((preset) => preset.match.some((term) => haystack.includes(term))) ?? fallback;
}

export function quizCategoryLabel(quiz: Pick<Quiz, "category">) {
  return quiz.category?.name ?? "Ohne Kategorie";
}
