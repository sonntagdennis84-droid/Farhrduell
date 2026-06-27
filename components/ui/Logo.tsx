export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      <div className="grid h-11 w-11 place-items-center rounded border border-show-gold/50 bg-show-gold text-lg font-black text-show-navy shadow-glow">
        FD
      </div>
      {!compact && (
        <div>
          <div className="text-2xl font-black uppercase tracking-normal text-white">Fahrduell</div>
          <div className="text-sm font-semibold text-show-gold">Das Fahrlehrer-Quiz</div>
        </div>
      )}
    </div>
  );
}
