import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const devHost = process.env.HOST || "127.0.0.1";
const devPort = Number(process.env.PORT || 5000);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
  },
  server: {
    host: devHost,
    port: devPort,
    hmr: {
      host: devHost,
      port: devPort,
      clientPort: devPort,
      protocol: "ws",
    },
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
