import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Carga las variables de entorno
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // 1. Esto es vital para GitHub Pages (evita la pantalla blanca)
    base: './',

    plugins: [react()],

    server: {
      port: 3000,
      host: '0.0.0.0',
    },

    // 2. Aquí definimos tus variables de entorno para que funcionen en producción
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY),
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
    },

    resolve: {
      alias: {
        '@': path.resolve(__dirname, './'),
      }
    }
  };
});
