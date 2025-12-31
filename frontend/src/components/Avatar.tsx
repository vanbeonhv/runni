import { memo, useMemo, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface AvatarProps {
  size?: number;
  className?: string;
}

// Track preloaded avatars to avoid duplicate preloading
const preloadedAvatars = new Set<string>();

export const Avatar = memo(function Avatar({ size = 40, className = '' }: AvatarProps) {
  const { user } = useAuth();
  const avatarUrl = useMemo(() => user?.avatarUrl, [user?.avatarUrl]);

  // Preload avatar when component mounts and avatarUrl is available
  useEffect(() => {
    if (avatarUrl && !preloadedAvatars.has(avatarUrl)) {
      preloadedAvatars.add(avatarUrl);
      // Preload using Image object for browser caching
      const img = new Image();
      img.src = avatarUrl;
    }
  }, [avatarUrl]);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || 'User avatar'}
        className={`rounded-full object-cover ${className}`}
        style={{ width: size, height: size }}
        loading="lazy"
        decoding="async"
      />
    );
  }

  // Fallback to gradient if no avatar
  return (
    <div
      className={`rounded-full bg-gradient-to-br from-blue-400 to-purple-500 ${className}`}
      style={{ width: size, height: size }}
    />
  );
});

