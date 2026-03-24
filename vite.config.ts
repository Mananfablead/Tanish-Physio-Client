import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import SitemapPlugin from "vite-plugin-sitemap";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, "/api"),
      },
    },
  },
  build: {
    emptyOutDir: false, // Prevent Vite from trying to empty the directory
    outDir: "dist",
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: mode === "production",
        drop_debugger: mode === "production",
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom"],
          ui: ["@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu"],
          router: ["react-router-dom"],
          redux: ["@reduxjs/toolkit", "react-redux"],
        },
      },
    },
    sourcemap: mode === "development",
    chunkSizeWarningLimit: 1000,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      protocolImports: true,
      include: ["process", "buffer", "stream", "util", "path"],
    }),
    // Image optimization for WebP conversion
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
    }),
    // Sitemap generation
    SitemapPlugin({
      hostname: "https://tanishphysiofitness.in",
    }),
  ].filter(Boolean),
  define: {
    global: "globalThis",
    "process.env": JSON.stringify({}),
    "process.browser": true,
    // FIX Bug 3: Polyfill process.nextTick for simple-peer
    "process.nextTick": "globalThis.queueMicrotask",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
      buffer: "buffer/",
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: ["buffer", "process", "stream-browserify", "util"],
  },
}));
