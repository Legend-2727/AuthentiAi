import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface AuthentiAiBadgeProps {
  className?: string;
}

const AuthentiAiBadge: React.FC<AuthentiAiBadgeProps> = ({ 
  className = '' 
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`
        px-4 py-2 rounded-lg shadow-lg border
        ${isDark 
          ? 'bg-gray-800 border-gray-700 text-white' 
          : 'bg-white border-gray-200 text-gray-800'
        }
      `}>
        <div className="flex items-center space-x-2">
          <div className={`
            w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
            ${isDark 
              ? 'bg-indigo-600 text-white' 
              : 'bg-indigo-500 text-white'
            }
          `}>
            Ai
          </div>
          <span className="font-semibold text-sm">AuthentiAi</span>
        </div>
      </div>
    </div>
  );
};

export default AuthentiAiBadge;
