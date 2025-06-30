import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface VeridicalBadgeProps {
  className?: string;
}

const VeridicalBadge: React.FC<VeridicalBadgeProps> = ({ 
  className = '' 
}) => {
  const { isDark } = useTheme();

  // Use white circle on dark backgrounds, black circle on light backgrounds
  const getImageSrc = () => {
    return isDark 
      ? '/src/assets/badges/white_circle_360x360.png'
      : '/src/assets/badges/black_circle_360x360.png';
  };

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`
        p-2 rounded-lg shadow-lg border backdrop-blur-sm
        ${isDark 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
        }
      `}>
        <img 
          src={getImageSrc()}
          alt="Veridica"
          className="w-10 h-10 object-contain"
        />
      </div>
    </div>
  );
};

export default VeridicalBadge;