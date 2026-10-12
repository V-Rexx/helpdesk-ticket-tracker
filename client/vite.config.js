import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// In development, calls to /api are forwarded to the Express server.
// Port 5001, because macOS AirPlay Receiver takes 5000.
export default defineConfig({
  plugins: [react()],
  server: { proxy: { "/api": "http://localhost:5001" } },
});
