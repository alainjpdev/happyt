import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.NODE_ENV === 'production' ? 'https://happytribe-backend-08a2fb6f96ac.herokuapp.com' : 'https://happytribe-backend-08a2fb6f96ac.herokuapp.com'),
  },
});
