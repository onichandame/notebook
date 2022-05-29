import { defineConfig } from "vite";
import swc from "rollup-plugin-swc";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  server: { watch: { usePolling: true }, hmr: { clientPort: 443 } },
  optimizeDeps: { exclude: [`ipfs-http-client`, `electron-fetch`] },
  plugins: [
    swc({
      jsc: {
        parser: {
          syntax: "typescript",
          // tsx: true, // If you use react
          dynamicImport: true,
          decorators: true,
        },
        target: "es2021",
        transform: {
          decoratorMetadata: true,
        },
      },
    }),
    react(
      // for decorator
      { babel: { parserOpts: { plugins: ["decorators-legacy"] } } },
    ),
  ],
  esbuild: false,
  build: {
    rollupOptions: { output: { manualChunks: undefined } },
    chunkSizeWarningLimit: 1024 * 1,
  },
});
