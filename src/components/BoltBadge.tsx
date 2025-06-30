import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import boltBadgeWhite from '../assets/badges/white_circle_360x360.png';
import boltBadgeBlack from '../assets/badges/black_circle_360x360.png';

interface BoltBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const BoltBadge: React.FC<BoltBadgeProps> = ({ size = 'md', className = '' }) => {
  const { isDark } = useTheme();
  
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8', 
    lg: 'w-12 h-12'
  };

  return (
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center transition-transform hover:scale-105 ${className}`}
      title="Built with bolt.new"
    >
      <img
        src={isDark ? boltBadgeWhite : boltBadgeBlack}
        alt="Built with bolt.new"
        className={sizeClasses[size]}
      />
    </a>
  );
};

export default BoltBadge;
