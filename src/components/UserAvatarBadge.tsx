'use client';

import type { User } from '../../typings';
import {
  getUserAvatarInitial,
  getUserAvatarShellClass,
  getUserAvatarTextClass,
  hasActiveMentorship,
} from '../lib/mentorshipUser';

type AvatarSize = 'sm' | 'md';

const SIZE_MAP: Record<AvatarSize, { wrap: string; circle: string; text: string }> = {
  sm: { wrap: 'w-8 h-8', circle: 'w-8 h-8', text: 'text-xs' },
  md: { wrap: 'w-10 h-10', circle: 'w-9 h-9', text: 'text-sm' },
};

type UserAvatarBadgeProps = {
  user: User | null;
  size?: AvatarSize;
  ringClassName?: string;
  /** Header con texto claro (video, fondo oscuro): inicial en cream. */
  onDarkHeader?: boolean;
};

export default function UserAvatarBadge({
  user,
  size = 'md',
  ringClassName = 'ring-palette-stone/30',
  onDarkHeader = false,
}: UserAvatarBadgeProps) {
  if (!user) return null;

  const mentorshipActive = hasActiveMentorship(user);
  const dims = SIZE_MAP[size];
  const shellClass = getUserAvatarShellClass(mentorshipActive, ringClassName, onDarkHeader);
  const textClass = getUserAvatarTextClass(mentorshipActive, onDarkHeader);
  const profileImageUrl = (user as User & { profileImageUrl?: string }).profileImageUrl;
  const initial = getUserAvatarInitial(user);

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dims.wrap}`}>
      <div
        className={`${dims.circle} rounded-full overflow-hidden flex items-center justify-center font-montserrat font-semibold ${shellClass} ${textClass} ${dims.text}`}
      >
        {profileImageUrl ? (
          <img src={profileImageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span>{initial}</span>
        )}
      </div>
    </div>
  );
}
