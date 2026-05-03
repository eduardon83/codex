import { useMemo } from 'react';

interface Props {
  photoUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
  size?: number;
  className?: string;
}

function getInitials(first?: string | null, last?: string | null, username?: string | null): string {
  const f = (first || '').trim();
  const l = (last || '').trim();
  if (f || l) return `${f[0] || ''}${l[0] || ''}`.toUpperCase() || '?';
  const u = (username || '').trim();
  return (u[0] || '?').toUpperCase();
}

// Treat existing legacy avatar IDs (e.g. "avatar-lince-iberico") as "no photo".
function isPhotoUrl(value?: string | null): value is string {
  if (!value) return false;
  return /^(https?:|data:|blob:)/.test(value);
}

export default function UserAvatar({
  photoUrl, firstName, lastName, username, size = 80, className = '',
}: Props) {
  const initials = useMemo(
    () => getInitials(firstName, lastName, username),
    [firstName, lastName, username],
  );
  const style = { width: size, height: size, fontSize: Math.round(size * 0.38) };

  if (isPhotoUrl(photoUrl)) {
    return (
      <img
        src={photoUrl}
        alt={firstName || username || 'Avatar'}
        className={`rounded-full object-cover border border-border ${className}`}
        style={style}
      />
    );
  }

  return (
    <div
      className={`rounded-full border border-border bg-secondary text-secondary-foreground flex items-center justify-center font-['Cormorant_Garamond'] font-medium ${className}`}
      style={style}
      aria-label={firstName || username || 'Avatar'}
    >
      {initials}
    </div>
  );
}
