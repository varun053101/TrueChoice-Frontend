import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const apiUrl = env.VITE_API_URL || 'http://localhost:3000';
  const allowedHosts = env.VITE_ALLOWED_HOSTS ? env.VITE_ALLOWED_HOSTS.split(',') : undefined; // Defaults to Vite's built-in if not set

  return {
    server: {
      host: "0.0.0.0",
      port: 8080,
      strictPort: false,
      allowedHosts: allowedHosts,
      // Proxy to avoid CORS issues - routes to backend without /api prefix
      proxy: {
        '/user': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          bypass: (req, res, options) => {
            if (req.headers.accept?.includes('text/html')) {
              return req.url;
            }
          },
        },
        '/admin': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          bypass: (req, res, options) => {
            if (req.headers.accept?.includes('text/html')) {
              return req.url;
            }
          },
        },
        '/superadmin': {
          target: apiUrl,
          changeOrigin: true,
          secure: false,
          ws: true,
          bypass: (req, res, options) => {
            if (req.headers.accept?.includes('text/html')) {
              return req.url;
            }
          },
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
