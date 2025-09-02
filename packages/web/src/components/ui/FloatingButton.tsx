import React from 'react';
import { LucideIcon } from 'lucide-react';
import { darkTheme } from '../../lib/theme';

interface FloatingButtonProps {
  icon: LucideIcon;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'notification';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  hasNotification?: boolean;
}

const FloatingButton: React.FC<FloatingButtonProps> = ({
  icon: Icon,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  hasNotification = false
}) => {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const iconSizes = {
    sm: 20,
    md: 24,
    lg: 28
  };

  const getButtonStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          background: `linear-gradient(135deg, #A855F7 0%, #EC4899 100%)`,
          boxShadow: `0 8px 32px #A855F740, 0 4px 16px rgba(0,0,0,0.3)`
        };
      case 'secondary':
        return {
          background: darkTheme.background.card,
          border: `1px solid ${darkTheme.background.glass}`,
          boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)'
        };
      case 'notification':
        return {
          background: hasNotification 
            ? `linear-gradient(135deg, #A855F7 0%, #EC4899 100%)`
            : darkTheme.background.card,
          border: hasNotification ? 'none' : `1px solid ${darkTheme.background.glass}`,
          boxShadow: hasNotification 
            ? `0 8px 32px #A855F740, 0 4px 16px rgba(0,0,0,0.3)`
            : '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2)'
        };
      default:
        return {};
    }
  };

  const getIconColor = () => {
    switch (variant) {
      case 'primary':
        return 'white';
      case 'secondary':
        return darkTheme.text.primary;
      case 'notification':
        return hasNotification ? 'white' : darkTheme.text.primary;
      default:
        return darkTheme.text.primary;
    }
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${sizeClasses[size]}
        rounded-full
        transition-all
        duration-300
        ease-out
        hover:scale-110
        active:scale-95
        flex
        items-center
        justify-center
        backdrop-blur-sm
        ${className}
      `}
      style={getButtonStyle()}
    >
      <Icon 
        size={iconSizes[size]} 
        style={{ color: getIconColor() }}
        className="transition-colors duration-200"
      />
      
      {/* Notification dot */}
      {variant === 'notification' && hasNotification && (
        <div 
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
          style={{ 
            background: darkTheme.neon.pink,
            boxShadow: `0 0 8px ${darkTheme.neon.pink}`
          }}
        />
      )}
    </button>
  );
};

export default FloatingButton;
