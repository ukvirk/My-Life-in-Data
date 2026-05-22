/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#05050A',
        surface: 'rgba(255, 255, 255, 0.03)',
        'surface-hover': 'rgba(255, 255, 255, 0.08)',
        neon: {
          pink: '#FF007F',
          cyan: '#00FFFF',
        },
        alert: {
          subtle: 'rgba(255, 0, 127, 0.2)',
          border: 'rgba(255, 0, 127, 0.5)',
        }
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'neon-pink': '0 0 10px rgba(255, 0, 127, 0.5)',
        'neon-cyan': '0 0 10px rgba(0, 255, 255, 0.5)',
      }
    },
  },
  plugins: [],
}
