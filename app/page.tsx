import { Suspense } from "react";
import { BarChart3, MonitorPlay, Smartphone, Trophy } from "lucide-react";
import { HomeLoginForm } from "@/components/auth/HomeLoginForm";
import { StartScreenMusic } from "@/components/StartScreenMusic";

export default function Home() {
  const highlights = [
    { icon: MonitorPlay, title: "Smartboard-ready", text: "Große Darstellung für Fragen, Medien, Timer und Auflösung." },
    { icon: Smartphone, title: "Mobile Teilnahme", text: "Teilnehmer antworten schnell per Smartphone, ohne App-Zwang." },
    { icon: BarChart3, title: "Diskussionen starten", text: "Heatmap und anonyme Stimmenverteilung für den Unterricht." },
    { icon: Trophy, title: "Quizshow-Finale", text: "Rangliste, Podium und Showelemente für mehr Motivation." }
  ];

  return (
    <main className="show-grid min-h-screen overflow-hidden">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(246,180,0,0.18),transparent_28%),radial-gradient(circle_at_82%_12%,rgba(37,99,235,0.2),transparent_30%),linear-gradient(180deg,rgba(3,9,20,0),rgba(3,9,20,0.82))]" />
      <div className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 lg:px-8">
        <header className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <img className="h-auto w-full max-w-[28rem]" src="/branding/fahrduell-logo-tacho.png" alt="Fahrduell" />
            <p className="mt-4 max-w-xl text-sm font-black uppercase tracking-[0.24em] text-show-gold">Das Fahrlehrer-Quiz</p>
          </div>
          <div className="w-full lg:max-w-md">
            <Suspense fallback={<div className="rounded-lg border border-white/10 bg-show-panel/95 p-5 shadow-2xl">Login wird geladen...</div>}>
              <HomeLoginForm />
            </Suspense>
          </div>
        </header>

        <section className="grid flex-1 gap-10 py-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(23rem,0.75fr)] lg:items-end">
          <div className="pb-4">
            <div className="inline-flex rounded-full border border-show-gold/30 bg-show-gold/10 px-4 py-2 text-xs font-black uppercase tracking-wide text-show-gold">
              Live-Unterricht mit Showmaster-Gefühl
            </div>
            <h1 className="mt-6 max-w-5xl text-5xl font-black leading-[0.98] text-white md:text-7xl">
              Fahrschulwissen wird zum Live-Duell.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-white/74">
              Fahrduell verbindet Quizverwaltung, Moderator-App, Smartboard-Ansicht und Smartphone-Teilnahme zu einer modernen Unterrichtsbühne.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <StartScreenMusic />
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/60">
                Online, mobil und für Live-Sessions vorbereitet.
              </div>
            </div>
          </div>

          <div className="grid gap-3">
            {highlights.map(({ icon: Icon, title, text }) => (
              <article key={title} className="grid grid-cols-[3.25rem_1fr] gap-4 rounded-lg border border-white/10 bg-show-panel/85 p-4 shadow-xl backdrop-blur transition hover:border-show-gold/45">
                <span className="grid h-12 w-12 place-items-center rounded border border-show-gold/25 bg-show-gold/10 text-show-gold">
                  <Icon size={23} />
                </span>
                <div>
                  <h2 className="text-lg font-black text-white">{title}</h2>
                  <p className="mt-1 text-sm font-semibold leading-relaxed text-white/60">{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
