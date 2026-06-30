import Link from "next/link";
import type { PropsWithChildren } from "react";
import { AppConnectBanner } from "@/components/app/AppConnectBanner";
import { Logo } from "@/components/ui/Logo";

export function AppShell({ children }: PropsWithChildren) {
  return (
    <main className="show-grid min-h-screen">
      <header className="border-b border-white/10 bg-show-navy/90">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link href="/dashboard">
            <Logo />
          </Link>
          <nav className="flex gap-3 text-sm font-semibold text-white/80">
            <Link className="hover:text-show-gold" href="/dashboard">
              Start
            </Link>
            <Link className="hover:text-show-gold" href="/quizzes">
              Bibliothek
            </Link>
            <Link className="hover:text-show-gold" href="/cloud">
              Cloud
            </Link>
            <Link className="hover:text-show-gold" href="/profile">
              Profil
            </Link>
            <form action="/api/auth/logout" method="post">
              <button className="hover:text-show-gold" type="submit">
                Logout
              </button>
            </form>
          </nav>
        </div>
      </header>
      <div className="mx-auto max-w-7xl px-4 py-8">{children}</div>
      <AppConnectBanner />
    </main>
  );
}
