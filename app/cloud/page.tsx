import Link from "next/link";
import { Bot, Cloud, Library, Share2, Store, Upload } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function CloudPage() {
  const cards = [
    { icon: Library, title: "Meine Quizze", text: "Persönliche Cloud-Ablage für eigene Quizpakete und Entwürfe." },
    { icon: Share2, title: "Geteilte Quizze", text: "Freigaben zwischen Admins, Moderatoren und Fahrschulen." },
    { icon: Store, title: "Marketplace", text: "Vorbereitung für kuratierte Quizbibliotheken und Vorlagen." },
    { icon: Upload, title: "Cloudspeicher", text: "Medien, Quizpakete und Unterrichtsmaterial zentral verwalten." },
    { icon: Bot, title: "AI Labs", text: "Später KI-gestützte Vorschläge, Analyse und Quizproduktion bündeln." },
    { icon: Cloud, title: "Synchronisierung", text: "Grundlage für mehrere Geräte, Teams und gemeinsame Bibliotheken." }
  ];

  return (
    <AppShell>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-show-gold">Cloud</p>
          <h1 className="mt-1 text-4xl font-black">Fahrduell Cloud</h1>
          <p className="mt-2 max-w-2xl text-white/65">Vorbereitet für Phase 2: Teilen, Freigeben, Marketplace und zentrale Quizbibliotheken.</p>
        </div>
        <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy shadow-glow" href="/dashboard">
          Zurück zum Start
        </Link>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 rounded-lg border border-white/10 bg-show-panel/80 p-2">
        <Link className="rounded px-4 py-3 font-black text-white/75 hover:bg-white/10 hover:text-white" href="/dashboard">Start</Link>
        <Link className="rounded px-4 py-3 font-black text-white/75 hover:bg-white/10 hover:text-white" href="/quizzes">Bibliothek</Link>
        <Link className="rounded bg-show-gold px-4 py-3 font-black text-show-navy" href="/cloud">Cloud</Link>
      </nav>

      <section className="mt-6 rounded-lg border border-show-gold/25 bg-show-panel/90 p-6 shadow-xl">
        <div className="grid gap-5 lg:grid-cols-[4rem_1fr_auto] lg:items-center">
          <span className="grid h-16 w-16 place-items-center rounded border border-show-gold/30 bg-show-gold/10 text-show-gold">
            <Cloud size={32} />
          </span>
          <div>
            <p className="text-sm font-black uppercase text-show-gold">Bereich vorbereitet</p>
            <h2 className="mt-2 text-2xl font-black">Noch nicht aktiv, aber architektonisch eingeplant</h2>
            <p className="mt-2 text-white/65">Die Oberfläche ist bewusst schon im finalen Navigationsmuster angelegt, damit Cloud, Marketplace, Medienbibliothek, AI Labs und Analytics später ohne großen Umbau ergänzt werden können.</p>
          </div>
          <div className="rounded border border-white/10 bg-black/20 px-4 py-3 text-sm font-black uppercase text-white/60">
            Phase 2
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-lg border border-white/10 bg-show-panel/90 p-5 shadow-xl transition hover:-translate-y-0.5 hover:border-show-gold/50 hover:shadow-glow">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">{card.title}</h2>
                  <p className="mt-2 text-sm font-semibold leading-relaxed text-white/60">{card.text}</p>
                </div>
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded border border-show-gold/30 bg-show-gold/10 text-show-gold">
                  <Icon size={24} />
                </span>
              </div>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
