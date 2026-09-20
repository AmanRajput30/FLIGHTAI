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
  
  const baseClasses = "inline-flex items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aervyn-status-cyan disabled:opacity-50 disabled:cursor-not-allowed font-labels pointer-events-auto";
  
  let variantClasses = "";
  
  switch (variant) {
    case 'action':
      variantClasses = `
        px-8 py-3 rounded font-bold text-[10px] tracking-widest uppercase gap-2
        border border-aervyn-status-cyan drop-shadow-[0_0_8px_rgba(56,189,248,0.2)]
        ${isActive 
          ? 'bg-aervyn-status-cyan text-white' 
          : 'bg-aervyn-status-cyan/20 text-aervyn-status-cyan hover:bg-aervyn-status-cyan hover:text-white'
        }
      `;
      break;
      
    case 'selector':
      variantClasses = `
        px-4 py-2 rounded text-[10px] font-bold uppercase tracking-widest
        border border-transparent
        ${isActive 
          ? 'bg-aervyn-status-cyan/20 text-aervyn-status-cyan border-aervyn-status-cyan shadow-[0_0_8px_rgba(56,189,248,0.2)]' 
          : 'text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light hover:border-aervyn-border-subtle'
        }
      `;
      break;

    case 'icon':
      variantClasses = `
        w-8 h-8 rounded-full flex items-center justify-center
        border border-transparent
        ${isActive 
          ? 'bg-aervyn-status-cyan/20 text-aervyn-status-cyan border-aervyn-status-cyan shadow-[0_0_8px_rgba(56,189,248,0.2)]' 
          : 'text-aervyn-text-secondary hover:text-aervyn-text-primary hover:bg-aervyn-panel-light hover:border-aervyn-border-subtle'
        }
      `;
      break;
      
    case 'toggle':
      variantClasses = `
        px-4 py-2 font-bold text-[10px] uppercase tracking-widest
        border
        ${isActive 
          ? 'bg-aervyn-status-cyan text-white border-aervyn-status-cyan shadow-[0_0_8px_rgba(56,189,248,0.3)]' 
          : 'bg-aervyn-panel-light text-aervyn-text-secondary border-aervyn-border-subtle hover:text-aervyn-text-primary hover:bg-aervyn-panel-base'
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

