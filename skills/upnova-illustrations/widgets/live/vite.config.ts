import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

const root = path.resolve(__dirname, "..");
export default defineConfig({
  root,
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [
      { find: /^~\/utils\/hooks\/useIsMobile$/, replacement: path.resolve(__dirname, "useIsMobile.ts") },
      { find: "~", replacement: path.resolve(root, "src") },
    ],
  },
  build: {
    emptyOutDir: true,
    minify: true,
    cssCodeSplit: false,
    lib: { entry: path.resolve(__dirname, process.env.ENTRY || "free-gift-banner.tsx"), name: "UpnovaVideoWidget", fileName: () => (process.env.OUT || "free-gift-banner") + ".js", formats: ["iife"] },
    outDir: path.resolve(__dirname, "dist"),
  },
  define: { "process.env.NODE_ENV": '"production"', __WIDGET_BUILD__: "true" },
});
