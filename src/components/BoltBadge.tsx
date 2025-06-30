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
    sm: 'w-8 h-8',
    md: 'w-12 h-12', 
    lg: 'w-16 h-16'
  };

  return (
    <a
      href="https://bolt.new"
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center transition-all duration-300 hover:scale-110 hover:drop-shadow-lg ${className}`}
      title="Built with bolt.new - Click to visit"
    >
      <img
        src={isDark ? boltBadgeWhite : boltBadgeBlack}
        alt="Built with bolt.new"
        className={`${sizeClasses[size]} drop-shadow-md hover:drop-shadow-xl transition-all duration-300`}
      />
    </a>
  );
};

export default BoltBadge;
