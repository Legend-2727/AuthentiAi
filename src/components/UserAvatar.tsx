import React from 'react';

interface UserAvatarProps {
  user: {
    email?: string;
    user_metadata?: {
      username?: string;
      avatar_url?: string;
      full_name?: string;
    };
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16'
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl'
  };

  // Get user initials
  const getInitials = () => {
    const username = user.user_metadata?.username;
    const fullName = user.user_metadata?.full_name;
    const email = user.email;

    if (fullName) {
      // If full name exists, get first letter of each word
      return fullName
        .split(' ')
        .map(word => word.charAt(0))
        .join('')
        .toUpperCase()
        .slice(0, 2); // Max 2 initials
    }

    if (username) {
      // If username exists, get first 1-2 characters
      return username.charAt(0).toUpperCase() + (username.charAt(1) || '').toUpperCase();
    }

    if (email) {
      // If only email, get first 1-2 characters before @
      const emailPrefix = email.split('@')[0];
      return emailPrefix.charAt(0).toUpperCase() + (emailPrefix.charAt(1) || '').toUpperCase();
    }

    return 'U'; // Default fallback
  };

  // Check if user has uploaded avatar
  const avatarUrl = user.user_metadata?.avatar_url;

  const baseClasses = `${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`;

  if (avatarUrl) {
    // Show user's uploaded image
    return (
      <img
        src={avatarUrl}
        alt="Profile"
        className={`${baseClasses} object-cover border-2 border-indigo-200 dark:border-indigo-600`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          target.nextElementSibling?.classList.remove('hidden');
        }}
      />
    );
  }

  // Show initials
  return (
    <div className={`${baseClasses} bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold ${textSizes[size]}`}>
      {getInitials()}
    </div>
  );
};

export default UserAvatar;
