import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import heroBannerWebp from "./assets/hero-banner.webp";
import heroBannerJpg from "./assets/hero-banner.jpg";

createRoot(document.getElementById("root")!).render(<App />);

if (import.meta.env.PROD && "serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").catch((error) => {
      console.error("Service worker registration failed:", error);
    });
  });
}

if (import.meta.env.PROD) {
  const preloadImage = (href: string) => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = href;
    (link as HTMLLinkElement & { fetchPriority?: string }).fetchPriority = "high";
    document.head.appendChild(link);
  };

  preloadImage(heroBannerWebp);
  preloadImage(heroBannerJpg);
}
