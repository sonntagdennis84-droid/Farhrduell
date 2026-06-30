import Link from "next/link";
import { Cloud, Library, Share2, Store } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";

export default function CloudPage() {
  const cards = [
    { icon: Library, title: "Meine Quizze", text: "Persönliche Cloud-Ablage für eigene Quizpakete." },
    { icon: Share2, title: "Geteilte Quizze", text: "Freigaben zwischen Admins, Moderatoren und Fahrschulen." },
    { icon: Store, title: "Marketplace", text: "Vorbereitung für kuratierte Quizbibliotheken und Vorlagen." }
  ];

  return (
    <AppShell>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-black uppercase text-show-gold">Cloud</p>
          <h1 className="mt-1 text-4xl font-black">Fahrduell Cloud</h1>
          <p className="mt-2 max-w-2xl text-white/65">Vorbereitet für Phase 2: Teilen, Freigeben, Marketplace und zentrale Quizbibliotheken.</p>
        </div>
        <Link className="rounded border border-show-gold bg-show-gold px-5 py-3 font-black text-show-navy" href="/dashboard">
          Zurück zum Start
        </Link>
      </div>

      <section className="mt-6 rounded-lg border border-white/10 bg-show-panel/90 p-6 shadow-xl">
        <div className="flex items-start gap-4">
          <span className="grid h-14 w-14 place-items-center rounded border border-show-gold/30 bg-show-gold/10 text-show-gold">
            <Cloud size={28} />
          </span>
          <div>
            <h2 className="text-2xl font-black">Bereich vorbereitet</h2>
            <p className="mt-2 text-white/65">Dieser Bereich ist bewusst noch ruhig gehalten. Die Struktur ist da, damit Cloud, Marketplace, Medienbibliothek, AI Labs und Analytics später ohne großen Umbau ergänzt werden können.</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <article key={card.title} className="rounded-lg border border-white/10 bg-white/5 p-5 shadow-xl">
              <span className="grid h-12 w-12 place-items-center rounded border border-white/15 bg-show-panel text-show-gold">
                <Icon size={24} />
              </span>
              <h2 className="mt-4 text-xl font-black">{card.title}</h2>
              <p className="mt-2 text-sm font-semibold text-white/60">{card.text}</p>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
