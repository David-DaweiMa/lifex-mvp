import React from 'react';

interface ProgressProps {
  value?: number;
  className?: string;
}

export const Progress: React.FC<ProgressProps> = ({ 
  value = 0, 
  className = '' 
}) => {
  const percentage = Math.min(Math.max(value, 0), 100);
  
  return (
    <div className={`relative h-2 w-full overflow-hidden rounded-full bg-secondary ${className}`}>
      <div 
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
