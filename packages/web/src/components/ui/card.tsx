import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-dark-card border border-dark-glass rounded-lg shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-dark-glass ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-text-primary ${className}`}>
      {children}
    </h3>
  );
};

export const CardDescription: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <p className={`text-sm text-text-muted ${className}`}>
      {children}
    </p>
  );
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};
