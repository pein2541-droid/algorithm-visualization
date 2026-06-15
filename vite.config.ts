import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          "vendor-ui": ["@headlessui/react", "@heroicons/react", "lucide-react"],
        },
      },
    },
  },
  plugins: [react()],
  resolve: {
    alias: { "@": "/src" },
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
