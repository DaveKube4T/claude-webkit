import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // immutable asume que estos archivos nunca se editan en el mismo path —
  // si hay que cambiar el video/poster, renombrar el archivo (ej. hero-loop-v2.mp4),
  // no sobrescribir; de lo contrario el navegador sirve una copia vieja hasta 1 año.
  async headers() {
    return [
      {
        source: "/hero-loop.mp4",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/hero-loop.webm",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
      {
        source: "/hero-poster.jpg",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/juridico", destination: "/juridico/index.html" },
      { source: "/juridico/", destination: "/juridico/index.html" },
    ];
  },
};

export default nextConfig;
