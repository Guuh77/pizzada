/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#E63946',      // Vermelho pizzaiolo
        secondary: '#F4A261',    // Amarelo queijo
        light: '#F1FAEE',        // Creme suave
        dark: '#1D3557',         // Cinza carvão
        accent: '#457B9D',       // Azul profundo
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
