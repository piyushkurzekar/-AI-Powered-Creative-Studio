
import React from 'react';

interface CloudElementProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const CloudElement: React.FC<CloudElementProps> = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-16 h-10',
    medium: 'w-24 h-15',
    large: 'w-32 h-20'
  };

  return (
    <div className={`${sizeClasses[size]} ${className} float-animation`}>
      <svg viewBox="0 0 100 60" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        <path
          d="M20 40C8 40 0 32 0 22C0 12 8 4 20 4C24 4 28 6 30 8C34 2 42 0 48 0C58 0 66 8 66 18C70 18 74 20 76 24C82 24 86 28 86 34C86 40 82 44 76 44H20Z"
          fill="white"
          fillOpacity="0.8"
        />
      </svg>
    </div>
  );
};

export default CloudElement;
