import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";
import swcReact from "vite-plugin-swc-react";

export default defineConfig({
  server: { watch: { usePolling: true }, hmr: { clientPort: 443 } },
  optimizeDeps: { exclude: [`ipfs-http-client`, `electron-fetch`] },
  plugins: [
    VitePWA({
      includeAssets: [`favicon.ico`, `apple-touch-icon.png`, `robots.txt`],
      manifest: {
        name: "My Note",
        short_name: "MyNote",
        description: "My private notebook for my personal data",
        theme_color: `#000000`,
        display: "standalone",
        background_color: "#757de8",
        categories: ["utilities"],
        icons: [
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: `any maskable`,
          },
        ],
        start_url: "/",
      },
    }),
    swcReact({
      swcOptions: {
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
      },
    }),
  ],
  esbuild: false,
  build: {
    rollupOptions: { output: { manualChunks: undefined } },
    chunkSizeWarningLimit: 1024 * 1,
  },
});
