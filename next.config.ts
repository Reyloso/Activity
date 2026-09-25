import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite acceder al dev server (y su websocket de HMR) desde otros equipos
  // de la red local, no solo desde localhost.
  allowedDevOrigins: ["192.168.1.57"],
  experimental: {
    serverActions: {
      bodySizeLimit: "20mb",
    },
  },
};

export default nextConfig;
