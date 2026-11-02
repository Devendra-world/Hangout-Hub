
import { useEffect, useState } from "react";
import "./AppSplash.css";

const isStandalone = () => {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    window.matchMedia("(display-mode: fullscreen)").matches ||
    (navigator as any).standalone === true
  );
};

export default function AppSplash() {
  const [show, setShow] = useState(() => {
    return typeof window !== "undefined" && isStandalone();
  });

  useEffect(() => {
    if (!show) return;

    const timer = window.setTimeout(() => {
      setShow(false);
    }, 2400);

    return () => window.clearTimeout(timer);
  }, [show]);

  if (!show) return null;

  return (
    <div className="app-splash">
      <div className="splash-content">

        {/* App Logo */}
        <div className="splash-logo-wrap">
          <div className="splash-glow"></div>

          <img
            src="/icons/icon-512.png"
            alt="Hangout Hub"
            className="splash-logo"
          />
        </div>

        {/* App Name */}
        <h1 className="splash-title">
          HANGOUT <span>HUB</span>
        </h1>

        <p className="splash-tagline">
          Your space. Your people. Your moments.
        </p>

        {/* Loading Animation */}
        <div className="splash-loader">
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

      <div className="splash-bottom">
        MADE FOR YOUR MOMENTS
      </div>
    </div>
  );
}
