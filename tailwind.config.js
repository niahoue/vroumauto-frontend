// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html", // Assure que Tailwind scanne votre fichier HTML principal
    "./src/**/*.{js,ts,jsx,tsx}", // Scanne tous les fichiers JS, TS, JSX, TSX dans le dossier src
  ],
  theme: {
    extend: {
      // Définissez vos couleurs personnalisées ici pour correspondre au logo.
      // Basé sur une interprétation générale de couleurs "automobile" et de ce qui pourrait être dans le logo Vroum-Auto.
      // VEUILLEZ AJUSTER CES VALEURS POUR QU'ELLES CORRESPONDENT PRÉCISÉMENT À VOTRE LOGO.
      colors: {
        // Couleurs primaires/secondaires pour le texte et les éléments clés
        blue: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Bleu principal pour les boutons, liens actifs
          700: '#4338CA', // Bleu plus foncé, pour le texte ou les éléments importants
          800: '#3730A3', // Bleu encore plus foncé, pour le texte du logo par exemple
          900: '#312E81',
        },
        green: {
          500: '#22C55E', // Vert pour les appels à l'action positifs (ex: "Voir nos véhicules")
          600: '#16A34A', // Vert plus foncé au survol
          700: '#15803D',
        },
        purple: {
          50: '#F5F3FF',
          100: '#EDE9FE',
          200: '#DDD6FE',
          300: '#C4B5FD',
          400: '#A78BFA',
          500: '#8B5CF6',
          600: '#7C3AED', // Violet pour les actions secondaires (ex: "Découvrir la location")
          700: '#6D28D9', // Violet plus foncé au survol
        },
        indigo: {
          600: '#4F46E5', // Un autre ton de bleu-violet pour varier
          700: '#4338CA',
        },
        gray: {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563', // Texte général
          700: '#374151', // Texte des titres
          800: '#1F2937', // Texte très foncé, arrière-plans sombres
          900: '#111827',
        },
      },
      // Définition de la famille de police "Inter" comme police sans-serif par défaut
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      // Ajout d'animations Keyframes pour les menus déroulants
      keyframes: {
        fadeIn: { // Renommé de fadeInDown pour correspondre au Header
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: { // Ajout de la keyframe slideDown
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      // Application des animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out forwards', // Renommé pour correspondre au Header
        'slide-down': 'slideDown 0.3s ease-out forwards', // Ajout de l'animation slide-down
      }
    },
  },
  plugins: [],
}
