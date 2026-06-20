import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        // Split heavy vendors into separate, independently-cacheable chunks so the
        // landing route doesn't ship Leaflet/Recharts it never uses. Order matters:
        // react-leaflet contains "react" but must land in the maps chunk.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("leaflet")) return "maps";
          if (id.includes("recharts") || id.includes("d3-") || id.includes("victory-")) return "charts";
          if (id.includes("react-router") || id.includes("@remix-run")) return "router";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) return "react";
          return "vendor";
        },
      },
    },
  },
});
