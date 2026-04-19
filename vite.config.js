import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["audio/soft-music.wav"],
      manifest: {
        name: "Layan's Wizard Mansion for Learning",
        short_name: "Wizard Mansion",
        start_url: "/",
        display: "standalone",
        background_color: "#FFFEF7",
        theme_color: "#7CB342",
        icons: []
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,wav,json}"]
      }
    })
  ],
  test: {
    environment: "node"
  }
});
