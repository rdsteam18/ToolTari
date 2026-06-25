/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      spacing: {
        '4': '4px',
        '8': '8px',
        '12': '12px',
        '16': '16px',
        '24': '24px',
        '32': '32px',
        '48': '48px',
        '64': '64px',
      },
      borderRadius: {
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
      },
      boxShadow: {
        'small': '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.1)',
        'medium': '0 4px 6px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.05)',
        'large': '0 10px 15px rgba(0,0,0,0.05), 0 4px 6px rgba(0,0,0,0.05)',
      },
      fontSize: {
        'xs': '12px',
        'sm': '14px',
        'base': '16px',
        'lg': '18px',
        'xl': '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      colors: {
        brand: {
          dark: '#0f172a',    // Technical slate
          light: '#f8fafc',   // Soft white
          primary: '#6366f1', // Sleek indigo
          secondary: '#4f46e5',
          border: '#e2e8f0',
        }
      },
      animation: {
        'fade-in': 'fadeIn 150ms linear forwards',
        'slide-up': 'slideUp 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'accordion-down': 'accordionDown 200ms cubic-bezier(0.87, 0, 0.13, 1) forwards',
        'accordion-up': 'accordionUp 200ms cubic-bezier(0.87, 0, 0.13, 1) forwards',
      },
      keyframes: {
        fadeIn: {
          'from': { opacity: '0' },
          'to': { opacity: '1' },
        },
        slideUp: {
          'from': { transform: 'translateY(8px)', opacity: '0' },
          'to': { transform: 'translateY(0)', opacity: '1' },
        },
        accordionDown: {
          'from': { height: '0', opacity: '0' },
          'to': { height: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        accordionUp: {
          'from': { height: 'var(--radix-accordion-content-height)', opacity: '1' },
          'to': { height: '0', opacity: '0' },
        }
      }
    },
  },
  plugins: [],
}
