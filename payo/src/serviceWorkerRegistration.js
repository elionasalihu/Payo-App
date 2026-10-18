// Registers the service worker in production builds.
// In development (`npm start`) it is skipped so you always see fresh code.
// Based on the official Create React App PWA template.

const isLocalhost = Boolean(
  window.location.hostname === "localhost" ||
    window.location.hostname === "[::1]" ||
    window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export function register(config = {}) {
  if (process.env.NODE_ENV !== "production" || !("serviceWorker" in navigator)) return;

  const publicUrl = new URL(process.env.PUBLIC_URL, window.location.href);
  if (publicUrl.origin !== window.location.origin) return;

  window.addEventListener("load", () => {
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

    if (isLocalhost) {
      checkValidServiceWorker(swUrl, config);
    } else {
      registerValidSW(swUrl, config);
    }
  });
}

function registerValidSW(swUrl, config) {
  navigator.serviceWorker
    .register(swUrl)
    .then((registration) => {
      if (!registration) return;
      config.onRegister?.(registration);

      // An update was already downloaded earlier and is waiting
      if (registration.waiting && navigator.serviceWorker.controller) {
        config.onUpdate?.(registration);
      }

      registration.onupdatefound = () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.onstatechange = () => {
          if (installing.state !== "installed") return;
          if (navigator.serviceWorker.controller) {
            // New version available; old one still controls the page
            config.onUpdate?.(registration);
          } else {
            // First install: app is now cached for offline use
            config.onSuccess?.(registration);
          }
        };
      };
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.error("[Payo] Service worker registration failed:", error);
    });
}

function checkValidServiceWorker(swUrl, config) {
  // On localhost, make sure the service worker file really exists
  // (otherwise unregister and reload).
  fetch(swUrl, { headers: { "Service-Worker": "script" } })
    .then((response) => {
      const contentType = response.headers.get("content-type");
      if (response.status === 404 || (contentType && !contentType.includes("javascript"))) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.unregister().then(() => window.location.reload());
        });
      } else {
        registerValidSW(swUrl, config);
      }
    })
    .catch(() => {
      // eslint-disable-next-line no-console
      console.log("[Payo] No internet connection. Running in offline mode.");
    });
}

export function unregister() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => registration.unregister()).catch(() => {});
  }
}
