import { avatarSrc, defaultAvatarId, normalizeAvatarId } from "@/lib/participant-avatars";
import { defaultParticipantEmoji } from "@/lib/participant-emojis";
import { cn } from "@/lib/utils";

const sizeClass = {
  sm: "h-9 w-9",
  md: "h-12 w-12",
  lg: "h-20 w-20",
  xl: "h-28 w-28"
};

const emojiSizeClass = {
  sm: "h-5 min-w-5 text-xs",
  md: "h-6 min-w-6 text-sm",
  lg: "h-8 min-w-8 text-lg",
  xl: "h-10 min-w-10 text-2xl"
};

export function ParticipantAvatar({
  avatarId,
  emoji,
  label,
  size = "md",
  showEmoji = true,
  priority = false
}: {
  avatarId?: number | null;
  emoji?: string | null;
  label?: string;
  size?: keyof typeof sizeClass;
  showEmoji?: boolean;
  priority?: boolean;
}) {
  const safeAvatarId = normalizeAvatarId(avatarId ?? defaultAvatarId);
  const safeEmoji = emoji || defaultParticipantEmoji;

  return (
    <span className={cn("relative inline-flex shrink-0 items-center justify-center rounded-full bg-black/20", sizeClass[size])}>
      <img
        alt={label ? `Avatar von ${label}` : `Avatar ${safeAvatarId}`}
        className="h-full w-full rounded-full object-contain"
        loading={priority ? "eager" : "lazy"}
        src={avatarSrc(safeAvatarId)}
      />
      {showEmoji && (
        <span className={cn("absolute -bottom-1 -right-1 grid place-items-center rounded-full border border-white/20 bg-show-navy/95 leading-none shadow-lg", emojiSizeClass[size])}>
          {safeEmoji}
        </span>
      )}
    </span>
  );
}
