import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 8080,
    strictPort: false,
    // Proxy to avoid CORS issues - routes to backend without /api prefix
    proxy: {
      '/user': {
        target: 'https://truechoice-ojol.onrender.com',
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
        target: 'https://truechoice-ojol.onrender.com',
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
        target: 'https://truechoice-ojol.onrender.com',
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
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
