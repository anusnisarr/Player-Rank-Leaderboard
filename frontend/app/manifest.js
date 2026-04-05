export default function manifest() {
  return {
    name: "RANKIFY",
    short_name: "RANKIFY",
    description: "Track your game stats and rankings",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0B",
    theme_color: "#FF4655",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}