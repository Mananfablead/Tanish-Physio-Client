// import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react-swc";
// import path from "path";
// import { componentTagger } from "lovable-tagger";
// import { nodePolyfills } from "vite-plugin-node-polyfills";
// import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
// import SitemapPlugin from "vite-plugin-sitemap";

// export default defineConfig(({ mode }) => ({
//   server: {
//     host: "::",
//     port: 8080,
//     // proxy: {
//     //   "/api": {
//     //     target: "http://localhost:5000",
//     //     changeOrigin: true,
//     //     secure: false,
//     //     rewrite: (path) => path.replace(/^\/api/, "/api"),
//     //   },
//     // },
//   },
//   build: {
//     emptyOutDir: false,
//     outDir: "dist",
//     minify: "terser",
//     terserOptions: {
//       compress: {
//         drop_console: mode === "production",
//         drop_debugger: mode === "production",
//         passes: 3,
//       },
//       output: {
//         comments: false,
//       },
//     },
//     cssMinify: true,
//     polyfillModulePreload: false,
//     rollupOptions: {
//       output: {
//         manualChunks: {
//           // Core React libraries - must load first
//           react: ["react", "react-dom"],
//           // Router and state management
//           router: ["react-router-dom"],
//           redux: ["@reduxjs/toolkit", "react-redux"],
//           // Utilities
//           socket: ["socket.io-client"],
//           query: ["@tanstack/react-query"],
//           charts: ["recharts"],
//           // Animations
//           animations: ["framer-motion"],
//         },
//       },
//     },
//     // Tree-shake unused code
//     treeshake: {
//       moduleSideEffects: false,
//       propertyReadSideEffects: false,
//       tryCatchDeoptimization: false,
//     },
//     sourcemap: mode === "development",
//     chunkSizeWarningLimit: 500,
//     target: "es2020",
//     reportCompressedSize: true,
//     // Aggressive minification
//     minifyIdentifiers: true,
//     minifyInternalExpressions: true,
//   },
//   plugins: [
//     react(),
//     mode === "development" && componentTagger(),
//     // Minimal polyfills for critical modules only
//     nodePolyfills({
//       protocolImports: true,
//       include: ["process"],
//     }),
//     // Aggressive image optimization
//     ViteImageOptimizer({
//       png: {
//         quality: 60,
//       },
//       jpeg: {
//         quality: 60,
//       },
//       jpg: {
//         quality: 60,
//       },
//       webp: {
//         quality: 70,
//       },
//       // Ensure AVIF doesn't get "re-optimized" into larger files.
//       avif: {
//         quality: 45,
//       },
//     }),
//     // Sitemap generation
//     SitemapPlugin({
//       hostname: "https://tanishphysiofitness.in",
//     }),
//   ].filter(Boolean),
//   define: {
//     global: "globalThis",
//     "process.env": JSON.stringify({}),
//     "process.browser": true,
//     "process.nextTick": "globalThis.queueMicrotask",
//     // Remove console in production
//     // __DEV__: `${mode === "development"}`,
//   },
//   resolve: {
//     alias: {
//       "@": path.resolve(__dirname, "./src"),
//       process: "process/browser",
//       stream: "stream-browserify",
//       util: "util",
//       buffer: "buffer/",
//     },
//     dedupe: ["react", "react-dom"],
//   },
//   optimizeDeps: {
//     include: [
//       "react",
//       "react-dom",
//       "react-router-dom",
//       "@reduxjs/toolkit",
//       "react-redux",
//       "process",
//     ],
//     exclude: ["framer-motion"],
//   },
// }));


import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig(({ mode }) => ({
  server: {
    host: true,
    port: 8080,
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,
    minify: "terser",
    sourcemap: false,
  },

  plugins: [
    react(),

    nodePolyfills({
      protocolImports: true,
      include: ["process"],
    }),
  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      process: "process/browser",
    },
  },

  define: {
    global: "globalThis",
    "process.env": {},
  },
}));