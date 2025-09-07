/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Colores del logo de Happy Tribe
        bg: '#FFFFFF', // Fondo principal (blanco)
        panel: '#FFFFFF', // Cards, paneles (blanco)
        sidebar: '#FFFFFF', // Sidebar y navbar (blanco)
        border: '#E5E7EB', // Bordes y separadores (gris claro)
        hover: '#F9FAFB', // Hover para paneles/cards (gris muy claro)
        
        // Colores de texto
        text: '#6A3A1E', // Texto principal (marrón del logo)
        'text-secondary': '#4B8B3B', // Texto secundario (verde medio)
        
        // Colores principales del logo Happy Tribe
        primary: '#4B8B3B', // Verde medio (texto "Tribe")
        'primary-light': '#A5C64C', // Verde claro (hojas superiores)
        'primary-dark': '#3F6E2B', // Verde oscuro (hojas del árbol)
        
        // Colores secundarios del logo
        secondary: '#6A3A1E', // Marrón (tronco y texto "Happy")
        'secondary-light': 'rgba(106, 58, 30, 0.1)', // Marrón claro para fondos
        'secondary-dark': '#5A3219', // Marrón oscuro para hover
        
        // Colores de estado
        success: '#4B8B3B', // Verde medio
        warning: '#A5C64C', // Verde claro
        error: '#DC2626', // Rojo estándar
        accent: '#3F6E2B', // Verde oscuro como acento
        
        // Colores del logo específicos
        'logo-brown': '#6A3A1E', // Marrón del tronco
        'logo-green-light': '#A5C64C', // Verde claro de hojas
        'logo-green-medium': '#4B8B3B', // Verde medio
        'logo-green-dark': '#3F6E2B', // Verde oscuro
        'logo-white': '#FFFFFF', // Blanco de fondo
        
        // Colores neutros actualizados
        'gray-50': '#F9FAFB', // Gris muy claro
        'gray-100': '#F3F4F6', // Gris claro
        'gray-200': '#E5E7EB', // Gris muy claro
        'gray-300': '#D1D5DB', // Gris claro
        'gray-400': '#9CA3AF', // Gris medio
        'gray-500': '#6B7280', // Gris
        'gray-600': '#4B5563', // Gris oscuro
        'gray-700': '#374151', // Gris muy oscuro
        'gray-800': '#1F2937', // Gris casi negro
        'gray-900': '#111827', // Negro suave
        
        // Colores de marca personalizados
        'brand-brown': '#6A3A1E', // Marrón del logo
        'brand-green-light': '#A5C64C', // Verde claro del logo
        'brand-green-medium': '#4B8B3B', // Verde medio del logo
        'brand-green-dark': '#3F6E2B', // Verde oscuro del logo
        'brand-white': '#FFFFFF', // Blanco del logo
      },
    },
  },
  plugins: [],
};
