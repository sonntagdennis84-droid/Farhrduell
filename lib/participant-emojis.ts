export const participantEmojis = [
  "😀", "😃", "😄", "😁", "😎", "🤩", "😊", "🙂", "😉", "🤓",
  "🥳", "🤠", "😇", "😋", "😜", "🤔", "😮", "😱", "🤗", "🫡",
  "👍", "👏", "🙌", "💪", "🤝", "🔥", "⚡", "💥", "🎯", "💡",
  "⭐", "🌟", "✨", "🏆", "🥇", "🥈", "🥉", "🎖️", "🎓", "📣",
  "🚗", "🚙", "🏎️", "🚕", "🚓", "🚒", "🚑", "🚌", "🚚", "🏍️",
  "🚦", "🛑", "⛽", "🅿️", "🛣️", "🔧", "🧭", "🛞", "🚀", "🛡️",
  "🎮", "🎲", "🎧", "🎵", "🎉", "🎊", "🌈", "☀️", "🌙", "🌍",
  "🐼", "🦁", "🦊", "🐶", "🐱", "🦅", "🦉", "🐬", "🦖", "🐯",
  "🦈", "🐺", "🐸", "🐧", "🦄", "🐝", "🦋", "🐢", "🐉", "🤖",
  "❤️", "🧡", "💛", "💚", "💙", "🤍", "🖤", "💎", "🍀", "✅"
] as const;

export type ParticipantEmoji = (typeof participantEmojis)[number];

export function isAllowedParticipantEmoji(value: string): value is ParticipantEmoji {
  return participantEmojis.includes(value as ParticipantEmoji);
}

export const defaultParticipantEmoji: ParticipantEmoji = "🚗";
