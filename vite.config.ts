import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { nodePolyfills } from "vite-plugin-node-polyfills";

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
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      protocolImports: true,
      include: ["process", "buffer", "stream", "util", "path"],
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
