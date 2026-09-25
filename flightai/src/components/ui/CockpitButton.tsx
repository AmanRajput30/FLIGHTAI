"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import Link from 'next/link';

export type ButtonVariant = 'action' | 'selector' | 'icon' | 'toggle';

interface CockpitButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: ButtonVariant;
  isActive?: boolean;
  href?: string;
  children: React.ReactNode;
}

export const CockpitButton = React.forwardRef<HTMLButtonElement | HTMLAnchorElement, CockpitButtonProps>(({ 
  variant = 'action', 
  isActive = false, 
  className = '', 
  href,
  children, 
  ...props 
}, ref) => {
  
  const baseClasses = "inline-flex items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#155EEF] disabled:opacity-50 disabled:cursor-not-allowed pointer-events-auto";
  
  let variantClasses = "";
  
  switch (variant) {
    case 'action':
      variantClasses = `
        px-4 py-2 rounded-md font-medium text-sm gap-2
        ${isActive 
          ? 'bg-aervyn-primary-hover text-white' 
          : 'bg-aervyn-primary text-white hover:bg-aervyn-primary-hover shadow-sm'
        }
      `;
      break;
      
    case 'selector':
      variantClasses = `
        px-4 py-2 rounded-md font-medium text-sm gap-2
        border border-transparent
        ${isActive 
          ? 'bg-aervyn-surface-dark-elevated text-aervyn-text-dark-primary border-aervyn-border-dark shadow-sm' 
          : 'text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark hover:border-aervyn-border-dark-subtle'
        }
      `;
      break;

    case 'icon':
      variantClasses = `
        w-8 h-8 rounded-md flex items-center justify-center
        border border-transparent transition-colors
        ${isActive 
          ? 'bg-aervyn-surface-dark-elevated text-aervyn-text-dark-primary border-aervyn-border-dark shadow-sm' 
          : 'text-aervyn-text-dark-secondary hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark hover:border-aervyn-border-dark-subtle'
        }
      `;
      break;
      
    case 'toggle':
      variantClasses = `
        px-3 py-1.5 rounded-md font-medium text-sm gap-2
        border transition-colors
        ${isActive 
          ? 'bg-aervyn-surface-dark-elevated text-aervyn-text-dark-primary border-aervyn-border-dark shadow-sm' 
          : 'bg-transparent text-aervyn-text-dark-secondary border-transparent hover:text-aervyn-text-dark-primary hover:bg-aervyn-surface-dark hover:border-aervyn-border-dark-subtle'
        }
      `;
      break;
  }

  const combinedClassName = `${baseClasses} ${variantClasses.replace(/\s+/g, ' ').trim()} ${className}`;

  if (href) {
    return (
      <Link href={href} className={combinedClassName}>
        {children}
      </Link>
    );
  }

  return (
    <motion.button 
      ref={ref as React.Ref<HTMLButtonElement>}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={combinedClassName}
      {...props}
    >
      {children}
    </motion.button>
  );
});

CockpitButton.displayName = 'CockpitButton';

