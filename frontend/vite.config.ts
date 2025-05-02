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
    watch: {
      usePolling: true,
    },
  },
});
