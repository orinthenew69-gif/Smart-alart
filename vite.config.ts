import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  // Load env variables (Vercel injects these automatically during build)
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    define: {
      // Use the environment variable if available (Production/Vercel), otherwise use the hardcoded fallback
      'process.env.API_KEY': JSON.stringify(env.API_KEY || "gen-lang-client-0608441157"),
      // Prevent crashes for libraries attempting to access process.env
      'process.env': {}
    }
  };
});