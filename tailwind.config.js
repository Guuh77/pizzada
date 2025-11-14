/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'background': '#F1FAEE', 
        'card': '#f4f4f4',
        'primary': '#E63946',      
        'primary-hover': '#D03340', 
        'secondary': '#F4A261',    
        'secondary-hover': '#E09358',
        'text-primary': '#1D3557',  
        'text-secondary': '#457B9D', 
        'border-color': '#E5E7EB', 
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'lg': '0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(29, 53, 87, 0.07), 0 10px 10px -5px rgba(29, 53, 87, 0.04)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        fadeIn: 'fadeIn 0.5s ease-out',
      },
    },
  },
  plugins: [],
}