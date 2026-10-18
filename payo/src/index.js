import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import reportWebVitals from "./reportWebVitals";

// Capture the browser's install prompt as early as possible
// (it can fire before React has mounted).
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  window.__payoInstallPrompt = event;
  window.dispatchEvent(new Event("payo:installable"));
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA: cache the app shell so Payo can be installed and opens offline.
serviceWorkerRegistration.register({
  onUpdate: (registration) =>
    window.dispatchEvent(new CustomEvent("payo:sw-update", { detail: registration })),
});

reportWebVitals();
