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
  
  const baseClasses = "inline-flex items-center justify-center transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-horizon-blue)] disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  
  switch (variant) {
    case 'action':
      // Action Button: Sleek, rounded, gradient hover
      variantClasses = `
        px-5 py-2.5 rounded-lg font-bold text-sm tracking-widest uppercase
        border border-white/10 shadow-[0_4px_15px_rgba(0,0,0,0.3)]
        ${isActive 
          ? 'bg-gradient-to-r from-[var(--color-horizon-blue)] to-[#006699] text-white border-transparent' 
          : 'bg-[#121826] text-white hover:bg-[#1a2333] hover:border-white/20'
        }
      `;
      break;
      
    case 'selector':
      // Selector Button: Choosing options. Softer radius, glow on active.
      variantClasses = `
        px-4 py-2 rounded-md font-medium text-sm
        border border-transparent
        ${isActive 
          ? 'bg-[var(--color-horizon-blue)]/10 text-[var(--color-horizon-blue)] shadow-[inset_0_0_10px_rgba(0,136,204,0.2)]' 
          : 'text-[var(--color-instrument-grey)] hover:text-white hover:bg-white/5'
        }
      `;
      break;

    case 'icon':
      // Icon Button: Rounded, translucent.
      variantClasses = `
        w-9 h-9 rounded-full flex items-center justify-center
        border border-transparent
        ${isActive 
          ? 'bg-[var(--color-horizon-blue)]/20 text-[var(--color-horizon-blue)] shadow-[0_0_15px_rgba(0,136,204,0.3)]' 
          : 'text-[var(--color-instrument-grey)] hover:text-white hover:bg-white/10'
        }
      `;
      break;
      
    case 'toggle':
      // Toggle Switch: Premium segmented feel
      variantClasses = `
        px-4 py-2 font-bold text-[11px] uppercase tracking-widest
        border-y border-x border-white/10 backdrop-blur-sm
        ${isActive 
          ? 'bg-[var(--color-horizon-blue)] text-white shadow-[0_0_15px_rgba(0,136,204,0.4)] border-transparent' 
          : 'bg-[#0a0f18]/80 text-[var(--color-instrument-grey)] hover:text-white hover:bg-[#151f30]/80'
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

