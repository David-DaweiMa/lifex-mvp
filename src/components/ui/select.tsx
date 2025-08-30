import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  placeholder?: string;
  className?: string;
}

interface SelectTriggerProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

interface SelectValueProps {
  placeholder?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({ 
  value, 
  onValueChange, 
  children, 
  placeholder,
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || '');
  const [selectedLabel, setSelectedLabel] = useState('');
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setSelectedValue(value || '');
  }, [value]);

  const handleSelect = (value: string, label: string) => {
    setSelectedValue(value);
    setSelectedLabel(label);
    setIsOpen(false);
    onValueChange?.(value);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, {
              ref: triggerRef,
              onClick: () => setIsOpen(!isOpen),
              isOpen,
              selectedValue: selectedLabel || placeholder
            });
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, {
              onSelect: handleSelect
            });
          }
        }
        return null;
      })}
    </div>
  );
};

export const SelectTrigger: React.FC<SelectTriggerProps & {
  ref?: React.Ref<HTMLButtonElement>;
  onClick?: () => void;
  isOpen?: boolean;
  selectedValue?: string;
}> = React.forwardRef(({ children, className = '', onClick, isOpen, selectedValue }, ref) => {
  return (
    <button
      ref={ref}
      onClick={onClick}
      className={`flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      <span className={selectedValue ? 'text-foreground' : 'text-muted-foreground'}>
        {selectedValue || 'Select an option'}
      </span>
      <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>
  );
});

export const SelectContent: React.FC<SelectContentProps & {
  onSelect?: (value: string, label: string) => void;
}> = ({ children, className = '', onSelect }) => {
  return (
    <div className={`absolute top-full left-0 right-0 z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover text-popover-foreground shadow-md ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          return React.cloneElement(child, {
            onClick: () => onSelect?.(child.props.value, child.props.children as string)
          });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem: React.FC<SelectItemProps & {
  onClick?: () => void;
}> = ({ value, children, className = '', onClick }) => {
  return (
    <div
      onClick={onClick}
      className={`relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${className}`}
    >
      {children}
    </div>
  );
};

export const SelectValue: React.FC<SelectValueProps> = ({ placeholder, className = '' }) => {
  return <span className={className}>{placeholder}</span>;
};
