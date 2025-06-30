import React from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface VeridicalBadgeProps {
  className?: string;
}

const VeridicalBadge: React.FC<VeridicalBadgeProps> = ({ 
  className = '' 
}) => {
  const { isDark } = useTheme();

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className={`
        p-2 rounded-lg shadow-lg border backdrop-blur-sm
        ${isDark 
          ? 'bg-gray-800/90 border-gray-700' 
          : 'bg-white/90 border-gray-200'
        }
      `}>
        <BlockchainShieldLogo isDark={isDark} />
      </div>
    </div>
  );
};

// New blockchain shield logo component
const BlockchainShieldLogo: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const mainColor = isDark ? '#fff' : '#000';
  const accentColor = isDark ? '#818cf8' : '#4f46e5';
  
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Shield Base */}
      <path 
        d="M20 3L5 9V20C5 28.2843 11.7157 35 20 35C28.2843 35 35 28.2843 35 20V9L20 3Z" 
        stroke={mainColor} 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Blockchain Nodes */}
      <circle cx="14" cy="16" r="2" fill={accentColor} />
      <circle cx="20" cy="22" r="2" fill={accentColor} />
      <circle cx="26" cy="16" r="2" fill={accentColor} />
      <circle cx="14" cy="28" r="2" fill={accentColor} />
      <circle cx="26" cy="28" r="2" fill={accentColor} />
      
      {/* Blockchain Connections */}
      <line x1="14" y1="16" x2="20" y2="22" stroke={accentColor} strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="16" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="16" x2="26" y2="16" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="28" x2="20" y2="22" stroke={accentColor} strokeWidth="1" />
      <line x1="20" y1="22" x2="26" y2="28" stroke={accentColor} strokeWidth="1" />
      <line x1="14" y1="28" x2="26" y2="28" stroke={accentColor} strokeWidth="1" />
    </svg>
  );
};

export default VeridicalBadge;