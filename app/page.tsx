import { Suspense } from "react";
import { HomeLoginForm } from "@/components/auth/HomeLoginForm";
import { StartScreenMusic } from "@/components/StartScreenMusic";

export default function Home() {
  return (
    <main className="show-grid min-h-screen">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6">
        <header className="grid gap-5 lg:grid-cols-[minmax(18rem,32rem)_minmax(24rem,1fr)] lg:items-start">
          <img className="h-auto w-full max-w-[30rem]" src="/branding/fahrduell-logo-tacho.png" alt="Fahrduell" />
          <div className="lg:justify-self-end">
            <Suspense fallback={<div className="rounded-lg border border-white/10 bg-show-panel/95 p-4 shadow-2xl">Login wird geladen...</div>}>
              <HomeLoginForm />
            </Suspense>
          </div>
        </header>

        <section className="grid flex-1 gap-8 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <p className="text-sm font-black uppercase tracking-wide text-show-gold">Das Fahrlehrer-Quiz</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-tight text-white md:text-7xl">
              Live-Unterricht, der sich wie eine Quizshow anfühlt.
            </h1>
            <p className="mt-6 max-w-3xl text-xl leading-relaxed text-white/75">
              Fahrduell verbindet Smartboard, Teilnehmer-Smartphones und Moderator-App zu einer schnellen, motivierenden Quizoberfläche für Fahrschulen.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <StartScreenMusic />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { title: "Live-Quiz", text: "Fragen starten, Antworten sperren, auflösen und den Punktestand gezielt einblenden." },
              { title: "Smartphone-Teilnahme", text: "Teilnehmer treten per QR-Code bei und antworten mobil mit großen Farbfeldern." },
              { title: "Moderator-App", text: "Steuerung vom Handy aus, inklusive Fernbedienung, Heatmap und Stimmenverteilung." },
              { title: "Quizverwaltung", text: "Quizze erstellen, importieren, kategorisieren, duplizieren und für den Unterricht vorbereiten." }
            ].map((item) => (
              <article key={item.title} className="rounded-lg border border-white/10 bg-show-panel/85 p-5 shadow-xl">
                <h2 className="text-xl font-black text-show-gold">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-white/65">{item.text}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
