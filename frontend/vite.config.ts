import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: "0.0.0.0", // allow access from outside of contaner
    open: false,
    strictPort: true,
    // 開發環境使用此方式才能處理 cors
    proxy: {
      "/app": {
        target: "http://backend-financial:8000",
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,
    },
  },
});
