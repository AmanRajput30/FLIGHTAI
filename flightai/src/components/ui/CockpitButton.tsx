import React from 'react';

export type ButtonVariant = 'action' | 'selector' | 'icon' | 'toggle';

interface CockpitButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isActive?: boolean;
  as?: React.ElementType;
  href?: string;
  children: React.ReactNode;
}

export function CockpitButton({ 
  variant = 'action', 
  isActive = false, 
  className = '', 
  as: Component = 'button',
  children, 
  ...props 
}: CockpitButtonProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  
  const baseClasses = "inline-flex items-center justify-center transition-all duration-100 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-horizon-blue)] disabled:opacity-50 disabled:cursor-not-allowed";
  
  let variantClasses = "";
  
  switch (variant) {
    case 'action':
      // Action Button: Commit actions. Rectangular, minimal 2px radius, physical pressed state.
      variantClasses = `
        px-4 py-2 rounded-[2px] font-bold text-sm tracking-wide uppercase
        border border-[var(--color-instrument-grey)] 
        bg-[var(--color-cockpit-black)] text-[var(--color-instrument-white)]
        hover:border-[var(--color-instrument-white)] hover:bg-[#111]
        active:scale-[0.98] active:bg-[#222] active:shadow-inner
        ${isActive ? 'bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)] text-white' : ''}
      `;
      break;
      
    case 'selector':
      // Selector Button: Choosing options. Flat, hard border, fills with horizon-blue when active.
      variantClasses = `
        px-3 py-1.5 rounded-none font-medium text-sm
        border border-[var(--color-instrument-grey)]
        text-[var(--color-instrument-grey)]
        hover:text-[var(--color-instrument-white)] hover:border-[var(--color-instrument-white)]
        active:scale-[0.98]
        ${isActive 
          ? 'bg-[var(--color-horizon-blue)] border-[var(--color-horizon-blue)] text-white' 
          : 'bg-transparent'
        }
      `;
      break;

    case 'icon':
      // Icon Button: Icon-only. Square hit area, transparent by default, hard border on hover.
      variantClasses = `
        w-8 h-8 rounded-none flex items-center justify-center
        border border-transparent
        text-[var(--color-instrument-grey)]
        hover:border-[var(--color-instrument-grey)] hover:text-[var(--color-instrument-white)]
        active:scale-[0.95] active:bg-[#111]
        ${isActive ? 'border-[var(--color-horizon-blue)] text-[var(--color-horizon-blue)]' : ''}
      `;
      break;
      
    case 'toggle':
      // Toggle Switch: Binary actions. Physical-looking rocker switch with depth.
      variantClasses = `
        px-3 py-1.5 rounded-[2px] font-bold text-xs uppercase tracking-wider
        border-y-2 border-x
        ${isActive 
          ? 'bg-[var(--color-horizon-blue)] border-t-[#00aaff] border-b-[#005580] border-x-[#0088CC] text-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]' 
          : 'bg-[#1a1c1e] border-t-[#2a2c2e] border-b-[#0a0c0e] border-x-[#1a1c1e] text-[var(--color-instrument-grey)] hover:text-white shadow-[0_2px_4px_rgba(0,0,0,0.5)]'
        }
        active:scale-[0.98]
      `;
      break;
  }

  return (
    <Component 
      className={`${baseClasses} ${variantClasses.replace(/\s+/g, ' ').trim()} ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}
