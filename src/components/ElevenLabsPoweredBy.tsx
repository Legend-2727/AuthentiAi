import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface ElevenLabsPoweredByProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const ElevenLabsPoweredBy: React.FC<ElevenLabsPoweredByProps> = ({ 
  className = '',
  size = 'md'
}) => {
  const { isDark } = useTheme();
  
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8';
      case 'lg':
        return 'w-20 h-20';
      default:
        return 'w-12 h-12';
    }
  };

  const getImageSrc = () => {
    return isDark 
      ? '/src/assets/badges/white_circle_360x360.png'
      : '/src/assets/badges/black_circle_360x360.png';
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <img 
        src={getImageSrc()}
        alt="Powered by ElevenLabs"
        className={`${getSizeClasses()} object-contain`}
      />
      <span className={`text-gray-600 dark:text-gray-400 ${
        size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'
      }`}>
        Powered by ElevenLabs
      </span>
    </div>
  );
};

export default ElevenLabsPoweredBy;
