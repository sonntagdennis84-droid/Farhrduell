"use client";

import Link from "next/link";
import { Copy, Edit3, Play, Star } from "lucide-react";
import type { Quiz } from "@/types/domain";
import { quizCategoryLabel, quizDisplay } from "@/lib/quiz-display";

function hasMedia(quiz: Quiz) {
  return quiz.questions.some((question) => Boolean(question.mediaUrl && question.mediaType !== "none"));
}

export function QuizLibraryCard({
  quiz,
  favorite,
  onFavorite,
  onPreview,
  onDuplicate,
  compact = false
}: {
  quiz: Quiz;
  favorite: boolean;
  onFavorite: () => void;
  onPreview: () => void;
  onDuplicate?: () => void;
  compact?: boolean;
}) {
  const display = quizDisplay(quiz);
  return (
    <article className="group overflow-hidden rounded-lg border border-white/10 bg-show-panel/90 shadow-xl transition duration-200 hover:-translate-y-0.5 hover:border-show-gold/50 hover:shadow-glow">
      <div className={`relative bg-gradient-to-br ${display.color} ${compact ? "min-h-28" : "min-h-36"} p-4`}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(246,180,0,0.24),transparent_38%)]" />
        <button
          className={favorite ? "absolute right-3 top-3 rounded border border-show-gold bg-show-gold px-3 py-2 text-show-navy" : "absolute right-3 top-3 rounded border border-white/20 bg-black/20 px-3 py-2 text-white hover:border-show-gold hover:text-show-gold"}
          onClick={onFavorite}
          type="button"
          aria-label={favorite ? "Favorit entfernen" : "Als Favorit markieren"}
        >
          <Star size={18} fill={favorite ? "currentColor" : "none"} />
        </button>
        <div className="relative flex h-full flex-col justify-end">
          <div className="text-5xl">{display.icon}</div>
          <div className="mt-3 inline-flex w-fit rounded border border-white/15 bg-black/25 px-3 py-1 text-xs font-black uppercase text-white/75">{quizCategoryLabel(quiz)}</div>
        </div>
      </div>
      <div className="p-4">
        <h2 className="line-clamp-2 text-xl font-black leading-tight">{quiz.title}</h2>
        {!compact && <p className="mt-2 line-clamp-2 min-h-10 text-sm font-semibold text-white/60">{quiz.description || "Kein Beschreibungstext hinterlegt."}</p>}
        <div className="mt-3 flex flex-wrap gap-2 text-xs font-black uppercase text-white/55">
          <span>{quiz.questions.length} Fragen</span>
          <span>{hasMedia(quiz) ? "Medien" : "Text"}</span>
          {quiz.isArchived && <span className="text-show-red">Archiv</span>}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-show-gold bg-show-gold px-3 py-2 font-black text-show-navy disabled:cursor-not-allowed disabled:opacity-50" disabled={quiz.isArchived} onClick={onPreview} type="button">
            <Play size={18} />
            Starten
          </button>
          <Link className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-white/15 px-3 py-2 font-black hover:border-show-gold hover:text-show-gold" href={`/quizzes/${quiz.id}/edit`}>
            <Edit3 size={18} />
            Bearbeiten
          </Link>
          {onDuplicate && (
            <button className="inline-flex min-h-11 items-center justify-center gap-2 rounded border border-white/15 px-3 py-2 font-black hover:border-show-gold hover:text-show-gold" onClick={onDuplicate} type="button">
              <Copy size={18} />
              Kopieren
            </button>
          )}
          <button className="inline-flex min-h-11 items-center justify-center rounded border border-white/15 px-3 py-2 font-black text-white/65 hover:border-show-gold hover:text-show-gold" onClick={onFavorite} type="button">
            {favorite ? "Favorit" : "Merken"}
          </button>
        </div>
      </div>
    </article>
  );
}
