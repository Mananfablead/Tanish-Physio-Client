// vite.config.ts
import { defineConfig } from "file:///Users/imac/Desktop/ReactJs/Fablead%20Project/Tanish/Tanish-Physio-Client/node_modules/vite/dist/node/index.js";
import react from "file:///Users/imac/Desktop/ReactJs/Fablead%20Project/Tanish/Tanish-Physio-Client/node_modules/@vitejs/plugin-react-swc/index.js";
import path from "path";
import { componentTagger } from "file:///Users/imac/Desktop/ReactJs/Fablead%20Project/Tanish/Tanish-Physio-Client/node_modules/lovable-tagger/dist/index.js";
import { nodePolyfills } from "file:///Users/imac/Desktop/ReactJs/Fablead%20Project/Tanish/Tanish-Physio-Client/node_modules/vite-plugin-node-polyfills/dist/index.js";
var __vite_injected_original_dirname = "/Users/imac/Desktop/ReactJs/Fablead Project/Tanish/Tanish-Physio-Client";
var vite_config_default = defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      "/api": {
        // target: "http://72.62.226.64:5000",
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
        rewrite: (path2) => path2.replace(/^\/api/, "/api")
      }
    }
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    nodePolyfills({
      protocolImports: true,
      include: ["process", "buffer", "stream", "util", "path"]
    })
  ].filter(Boolean),
  define: {
    global: "globalThis",
    "process.env": JSON.stringify({}),
    "process.browser": true
  },
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      process: "process/browser",
      stream: "stream-browserify",
      util: "util",
      buffer: "buffer/"
    },
    dedupe: ["react", "react-dom"]
  },
  optimizeDeps: {
    include: ["buffer", "process", "stream-browserify", "util"]
  }
}));
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvaW1hYy9EZXNrdG9wL1JlYWN0SnMvRmFibGVhZCBQcm9qZWN0L1RhbmlzaC9UYW5pc2gtUGh5c2lvLUNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2ltYWMvRGVza3RvcC9SZWFjdEpzL0ZhYmxlYWQgUHJvamVjdC9UYW5pc2gvVGFuaXNoLVBoeXNpby1DbGllbnQvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2ltYWMvRGVza3RvcC9SZWFjdEpzL0ZhYmxlYWQlMjBQcm9qZWN0L1RhbmlzaC9UYW5pc2gtUGh5c2lvLUNsaWVudC92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZyB9IGZyb20gXCJ2aXRlXCI7XG5pbXBvcnQgcmVhY3QgZnJvbSBcIkB2aXRlanMvcGx1Z2luLXJlYWN0LXN3Y1wiO1xuaW1wb3J0IHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCB7IGNvbXBvbmVudFRhZ2dlciB9IGZyb20gXCJsb3ZhYmxlLXRhZ2dlclwiO1xuaW1wb3J0IHsgbm9kZVBvbHlmaWxscyB9IGZyb20gXCJ2aXRlLXBsdWdpbi1ub2RlLXBvbHlmaWxsc1wiO1xuXG4vLyBodHRwczovL3ZpdGVqcy5kZXYvY29uZmlnL1xuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKCh7IG1vZGUgfSkgPT4gKHtcbiAgc2VydmVyOiB7XG4gICAgaG9zdDogXCI6OlwiLFxuICAgIHBvcnQ6IDgwODAsXG4gICAgICBwcm94eToge1xuICAgICAgXCIvYXBpXCI6IHtcbiAgICAgICAgLy8gdGFyZ2V0OiBcImh0dHA6Ly83Mi42Mi4yMjYuNjQ6NTAwMFwiLFxuICAgICAgICB0YXJnZXQ6IFwiaHR0cDovL2xvY2FsaG9zdDo1MDAwXCIsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgICAgc2VjdXJlOiBmYWxzZSxcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sIFwiL2FwaVwiKSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgbW9kZSA9PT0gXCJkZXZlbG9wbWVudFwiICYmIGNvbXBvbmVudFRhZ2dlcigpLFxuICAgIG5vZGVQb2x5ZmlsbHMoe1xuICAgICAgcHJvdG9jb2xJbXBvcnRzOiB0cnVlLFxuICAgICAgaW5jbHVkZTogW1wicHJvY2Vzc1wiLCBcImJ1ZmZlclwiLCBcInN0cmVhbVwiLCBcInV0aWxcIiwgXCJwYXRoXCJdLFxuICAgIH0pLFxuICBdLmZpbHRlcihCb29sZWFuKSxcbiAgZGVmaW5lOiB7XG4gICAgZ2xvYmFsOiBcImdsb2JhbFRoaXNcIixcbiAgICBcInByb2Nlc3MuZW52XCI6IEpTT04uc3RyaW5naWZ5KHt9KSxcbiAgICBcInByb2Nlc3MuYnJvd3NlclwiOiB0cnVlLFxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgIFwiQFwiOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCBcIi4vc3JjXCIpLFxuICAgICAgcHJvY2VzczogXCJwcm9jZXNzL2Jyb3dzZXJcIixcbiAgICAgIHN0cmVhbTogXCJzdHJlYW0tYnJvd3NlcmlmeVwiLFxuICAgICAgdXRpbDogXCJ1dGlsXCIsXG4gICAgICBidWZmZXI6IFwiYnVmZmVyL1wiLFxuICAgIH0sXG4gICAgZGVkdXBlOiBbXCJyZWFjdFwiLCBcInJlYWN0LWRvbVwiXSxcbiAgfSxcbiAgb3B0aW1pemVEZXBzOiB7XG4gICAgaW5jbHVkZTogW1wiYnVmZmVyXCIsIFwicHJvY2Vzc1wiLCBcInN0cmVhbS1icm93c2VyaWZ5XCIsIFwidXRpbFwiXSxcbiAgfSxcbn0pKTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBeVksU0FBUyxvQkFBb0I7QUFDdGEsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sVUFBVTtBQUNqQixTQUFTLHVCQUF1QjtBQUNoQyxTQUFTLHFCQUFxQjtBQUo5QixJQUFNLG1DQUFtQztBQU96QyxJQUFPLHNCQUFRLGFBQWEsQ0FBQyxFQUFFLEtBQUssT0FBTztBQUFBLEVBQ3pDLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNKLE9BQU87QUFBQSxNQUNQLFFBQVE7QUFBQTtBQUFBLFFBRU4sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsUUFBUTtBQUFBLFFBQ1IsU0FBUyxDQUFDQSxVQUFTQSxNQUFLLFFBQVEsVUFBVSxNQUFNO0FBQUEsTUFDbEQ7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sU0FBUyxpQkFBaUIsZ0JBQWdCO0FBQUEsSUFDMUMsY0FBYztBQUFBLE1BQ1osaUJBQWlCO0FBQUEsTUFDakIsU0FBUyxDQUFDLFdBQVcsVUFBVSxVQUFVLFFBQVEsTUFBTTtBQUFBLElBQ3pELENBQUM7QUFBQSxFQUNILEVBQUUsT0FBTyxPQUFPO0FBQUEsRUFDaEIsUUFBUTtBQUFBLElBQ04sUUFBUTtBQUFBLElBQ1IsZUFBZSxLQUFLLFVBQVUsQ0FBQyxDQUFDO0FBQUEsSUFDaEMsbUJBQW1CO0FBQUEsRUFDckI7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssS0FBSyxRQUFRLGtDQUFXLE9BQU87QUFBQSxNQUNwQyxTQUFTO0FBQUEsTUFDVCxRQUFRO0FBQUEsTUFDUixNQUFNO0FBQUEsTUFDTixRQUFRO0FBQUEsSUFDVjtBQUFBLElBQ0EsUUFBUSxDQUFDLFNBQVMsV0FBVztBQUFBLEVBQy9CO0FBQUEsRUFDQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsVUFBVSxXQUFXLHFCQUFxQixNQUFNO0FBQUEsRUFDNUQ7QUFDRixFQUFFOyIsCiAgIm5hbWVzIjogWyJwYXRoIl0KfQo=
