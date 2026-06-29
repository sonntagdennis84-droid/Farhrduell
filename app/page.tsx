import Link from "next/link";
import { StartScreenMusic } from "@/components/StartScreenMusic";

export default function Home() {
  return (
    <main className="show-grid flex min-h-screen items-center">
      <div className="mx-auto grid w-full max-w-6xl gap-10 px-5 py-10 md:grid-cols-[1.1fr_0.9fr] md:items-center">
        <section>
          <img className="h-auto w-full max-w-[20rem]" src="/branding/fahrduell-home-logo.png" alt="Fahrduell" />
          <h1 className="mt-10 max-w-3xl text-5xl font-black leading-tight text-white md:text-7xl">Fahrduell</h1>
          <p className="mt-5 max-w-2xl text-xl text-white/78">
            Die installierbare Moderator-App für Live-Unterricht mit Smartboard, Teilnehmer-Handys und Showmaster-Steuerung.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="rounded border border-show-gold bg-show-gold px-6 py-3 font-black text-show-navy shadow-glow" href="/login">
              Login
            </Link>
            <Link className="rounded border border-white/20 px-6 py-3 font-bold text-white hover:border-show-gold" href="/dashboard">
              Zum Dashboard
            </Link>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <StartScreenMusic />
          </div>
          <p className="mt-4 max-w-2xl text-sm font-semibold text-white/58">
            Auf Android in Chrome öffnen und zum Startbildschirm hinzufügen. Danach kann der Moderator direkt in die App und braucht keinen separaten QR-Code mehr.
          </p>
        </section>
        <section className="rounded-lg border border-white/10 bg-show-panel/90 p-6 shadow-2xl">
          <div className="text-sm font-bold uppercase text-show-gold">App bereit</div>
          <div className="mt-5 grid gap-3">
            {["Android installierbar", "Moderator ohne QR direkt im Dashboard", "Bild, Ton und Video vorbereitet", "Remote-Steuerung auf dem Handy"].map((item) => (
              <div key={item} className="rounded border border-white/10 bg-white/5 p-4 text-lg font-bold">
                {item}
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
