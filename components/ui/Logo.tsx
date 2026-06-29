export function Logo({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return <img className="h-auto w-full max-w-[8rem]" src="/branding/fahrduell-logo-tacho.png" alt="Fahrduell" />;
  }

  return (
    <div className="flex items-center gap-3">
      <img className="h-auto w-full max-w-[15rem]" src="/branding/fahrduell-logo-tacho.png" alt="Fahrduell" />
    </div>
  );
}
