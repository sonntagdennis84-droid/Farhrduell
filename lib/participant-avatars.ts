export type ParticipantAvatar = {
  id: number;
  label: string;
  category: "Fahrzeuge" | "Verkehr" | "Berufe" | "Tiere" | "Fantasy" | "Sport" | "Funny";
};

const avatarNames = [
  ["Sportwagen", "Fahrzeuge"], ["Cabrio", "Fahrzeuge"], ["Rennwagen", "Fahrzeuge"], ["Oldtimer", "Fahrzeuge"],
  ["Gelaendewagen", "Fahrzeuge"], ["Pickup", "Fahrzeuge"], ["Kleinwagen", "Fahrzeuge"], ["Elektroauto", "Fahrzeuge"],
  ["Motorrad", "Fahrzeuge"], ["Bus", "Fahrzeuge"], ["LKW", "Fahrzeuge"], ["Roller", "Fahrzeuge"],
  ["Ampel", "Verkehr"], ["Stoppschild", "Verkehr"], ["Verkehrszeichen", "Verkehr"], ["Leitkegel", "Verkehr"],
  ["Lenkrad", "Verkehr"], ["Blitzer", "Verkehr"], ["Parkplatz", "Verkehr"], ["Tankstelle", "Verkehr"],
  ["Zebrastreifen", "Verkehr"], ["Baustelle", "Verkehr"], ["Autobahn", "Verkehr"], ["Kreisverkehr", "Verkehr"],
  ["Fahrlehrer", "Berufe"], ["Feuerwehr", "Berufe"], ["Polizei", "Berufe"], ["Mechaniker", "Berufe"],
  ["Pilot", "Berufe"], ["Rettungsdienst", "Berufe"], ["Busfahrer", "Berufe"], ["LKW-Fahrer", "Berufe"],
  ["Pruefer", "Berufe"], ["Ingenieur", "Berufe"], ["Trainer", "Berufe"], ["Navigator", "Berufe"],
  ["Panda", "Tiere"], ["Loewe", "Tiere"], ["Fuchs", "Tiere"], ["Hund", "Tiere"],
  ["Katze", "Tiere"], ["Adler", "Tiere"], ["Eule", "Tiere"], ["Delfin", "Tiere"],
  ["Dinosaurier", "Tiere"], ["Tiger", "Tiere"], ["Hai", "Tiere"], ["Husky", "Tiere"],
  ["Ritter", "Fantasy"], ["Zauberer", "Fantasy"], ["Roboter", "Fantasy"], ["Alien", "Fantasy"],
  ["Drache", "Fantasy"], ["Wikinger", "Fantasy"], ["Astronaut", "Fantasy"], ["Superheld", "Fantasy"],
  ["Ninja", "Fantasy"], ["Magierin", "Fantasy"], ["Maskottchen", "Fantasy"], ["Cyberhelm", "Fantasy"],
  ["Fussball", "Sport"], ["Rennfahrer", "Sport"], ["Motorradfahrer", "Sport"], ["Mountainbike", "Sport"],
  ["Surfer", "Sport"], ["Skater", "Sport"], ["Basketball", "Sport"], ["Tennis", "Sport"],
  ["Champion", "Sport"], ["Zielscheibe", "Sport"], ["Blitz", "Funny"], ["Sonnenbrille", "Funny"],
  ["Krone", "Funny"], ["Glitzerstern", "Funny"], ["Rakete", "Funny"], ["Controller", "Funny"],
  ["Konfetti", "Funny"], ["Gluecksbringer", "Funny"], ["Herz", "Funny"], ["Smiley", "Funny"]
] as const;

export const participantAvatars: ParticipantAvatar[] = avatarNames.map(([label, category], index) => ({
  id: index + 1,
  label,
  category
})) as ParticipantAvatar[];

export const defaultAvatarId = 1;

export function avatarSrc(avatarId?: number | null) {
  const id = isAllowedAvatarId(avatarId) ? avatarId : defaultAvatarId;
  return `/assets/avatars/avatar-${String(id).padStart(3, "0")}.png`;
}

export function isAllowedAvatarId(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 1 && value <= participantAvatars.length;
}

export function normalizeAvatarId(value: unknown) {
  const numeric = typeof value === "string" ? Number(value) : value;
  return isAllowedAvatarId(numeric) ? numeric : defaultAvatarId;
}
