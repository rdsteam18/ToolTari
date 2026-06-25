import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  isLoading = false,
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-bold rounded-md text-sm transition-smooth select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2';

  const variants = {
    primary: 'bg-primary hover:bg-primary-hover text-white shadow-small focus-visible:ring-primary/40 focus-visible:ring-offset-bg-base',
    secondary: 'bg-bg-surface hover:bg-bg-base text-text-primary border border-border-base shadow-small focus-visible:ring-primary/20 focus-visible:ring-offset-bg-base',
    outline: 'bg-transparent border border-border-base text-text-primary hover:bg-bg-base focus-visible:ring-primary/20 focus-visible:ring-offset-bg-base',
    ghost: 'hover:bg-bg-base text-text-secondary hover:text-text-primary focus-visible:ring-primary/20 focus-visible:ring-offset-bg-base',
    danger: 'bg-danger hover:opacity-90 text-white shadow-small focus-visible:ring-danger/40 focus-visible:ring-offset-bg-base'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
}
