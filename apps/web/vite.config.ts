import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "../..", "");

  return {
    envDir: "../..",
    plugins: [sveltekit()],
    optimizeDeps: {
      // maplibre-gl v5 вычисляет URL воркера от import.meta.url; пре-бандлинг
      // ломает этот путь (.vite/deps/maplibre-gl-worker.mjs не существует).
      exclude: ["maplibre-gl"]
    },
    server: {
      host: env.WEB_HOST ?? "0.0.0.0",
      port: Number(env.WEB_PORT ?? 3000),
      proxy: {
        "/api": {
          target: env.INTERNAL_API_URL ?? "http://localhost:3001"
        },
        "/health": {
          target: env.INTERNAL_API_URL ?? "http://localhost:3001"
        }
      }
    }
  };
});
