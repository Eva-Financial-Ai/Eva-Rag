import React from 'react';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface AvatarProps {
  name: string;
  src?: string;
  size?: AvatarSize;
  className?: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
}

export const Avatar: React.FC<AvatarProps> = ({
  name,
  src,
  size = 'md',
  className = '',
  status,
}) => {
  // Get initials from name
  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Define size classes
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  // Generate a consistent background color based on the name
  const getBackgroundColor = (name: string): string => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-indigo-500',
    ];

    // Simple hash function to get a consistent index
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  };

  return (
    <div className={`relative inline-block ${className}`}>
      {src ? (
        <img src={src} alt={name} className={`${sizeClasses[size]} rounded-full object-cover`} />
      ) : (
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-medium ${getBackgroundColor(name)}`}
          title={name}
        >
          {getInitials(name)}
        </div>
      )}
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${
              status === 'online'
                ? 'bg-green-400'
                : status === 'away'
                  ? 'bg-yellow-400'
                  : status === 'busy'
                    ? 'bg-red-400'
                    : 'bg-gray-400'
            }
            ${
              size === 'xs'
                ? 'w-1.5 h-1.5'
                : size === 'sm'
                  ? 'w-2 h-2'
                  : size === 'md'
                    ? 'w-2.5 h-2.5'
                    : size === 'lg'
                      ? 'w-3 h-3'
                      : 'w-4 h-4'
            }`}
        />
      )}
    </div>
  );
};

export default Avatar;
