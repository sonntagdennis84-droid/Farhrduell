"use client";

export function QRCodePanel({ qrCode, joinCode, joinUrl }: { qrCode: string; joinCode: string; joinUrl: string }) {
  return (
    <div className="text-center">
      <img className="mx-auto h-72 w-72 rounded-lg border-4 border-white bg-white p-3" src={qrCode} alt={`QR-Code für ${joinCode}`} />
      <div className="mt-4 text-5xl font-black tracking-normal text-show-gold">{joinCode}</div>
      <div className="mt-2 break-all text-sm text-white/70">{joinUrl}</div>
    </div>
  );
}
