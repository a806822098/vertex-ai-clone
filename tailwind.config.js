/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Vertex AI inspired dark theme colors
        'vertex': {
          'bg-primary': '#1a1a1a',      // Main background
          'bg-secondary': '#252525',     // Card/Panel background
          'bg-tertiary': '#2d2d2d',      // Hover states
          'bg-elevated': '#333333',      // Elevated elements
          'border': '#404040',           // Borders
          'text-primary': '#e5e5e5',     // Primary text
          'text-secondary': '#a3a3a3',   // Secondary text
          'text-tertiary': '#737373',    // Tertiary text
          'accent': '#3b82f6',           // Primary blue accent
          'accent-hover': '#2563eb',     // Hover state for accent
          'success': '#10b981',          // Success state
          'error': '#ef4444',            // Error state
          'warning': '#f59e0b',          // Warning state
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.2s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        }
      }
    },
  },
  plugins: [],
}