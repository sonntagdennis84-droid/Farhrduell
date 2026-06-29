export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <img className="h-auto w-full max-w-[9.5rem]" src="/branding/fahrduell-home-logo.png" alt="Fahrduell" />;
  }

  return (
    <div className="flex items-center gap-3">
      <img className="h-auto w-full max-w-[18rem]" src="/branding/fahrduell-home-logo.png" alt="Fahrduell" />
    </div>
  );
}
