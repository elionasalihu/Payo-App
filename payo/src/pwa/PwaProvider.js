import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

/*
 * PWA state for the whole app:
 *  - canInstall / promptInstall(): the browser's "Install app" prompt (Chrome, Edge, Android)
 *  - isIOS: Safari has no prompt, so we show "Share → Add to Home Screen" instructions
 *  - isInstalled: running as an installed app (standalone window)
 *  - online: network status, for the offline banner
 *  - updateReady / applyUpdate(): a new version was downloaded by the service worker
 */

const PwaContext = createContext(null);

const standalone = () =>
  window.matchMedia?.("(display-mode: standalone)").matches || window.navigator.standalone === true;

export function PwaProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(() => window.__payoInstallPrompt || null);
  const [isInstalled, setIsInstalled] = useState(standalone);
  const [online, setOnline] = useState(() => navigator.onLine !== false);
  const [waitingWorker, setWaitingWorker] = useState(null);

  const isIOS =
    /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  useEffect(() => {
    const onInstallable = () => setDeferredPrompt(window.__payoInstallPrompt || null);
    const onInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
      window.__payoInstallPrompt = null;
    };
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onUpdate = (e) => setWaitingWorker(e.detail?.waiting || null);

    window.addEventListener("payo:installable", onInstallable);
    window.addEventListener("appinstalled", onInstalled);
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("payo:sw-update", onUpdate);

    const mq = window.matchMedia?.("(display-mode: standalone)");
    const onMode = () => setIsInstalled(standalone());
    mq?.addEventListener?.("change", onMode);

    return () => {
      window.removeEventListener("payo:installable", onInstallable);
      window.removeEventListener("appinstalled", onInstalled);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("payo:sw-update", onUpdate);
      mq?.removeEventListener?.("change", onMode);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return "unavailable";
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    window.__payoInstallPrompt = null;
    return outcome;
  }, [deferredPrompt]);

  const applyUpdate = useCallback(() => {
    if (!waitingWorker) return;
    navigator.serviceWorker?.addEventListener("controllerchange", () => window.location.reload(), { once: true });
    waitingWorker.postMessage({ type: "SKIP_WAITING" });
  }, [waitingWorker]);

  const value = useMemo(
    () => ({
      canInstall: Boolean(deferredPrompt) && !isInstalled,
      showIOSHint: isIOS && !isInstalled,
      isInstalled,
      isIOS,
      online,
      updateReady: Boolean(waitingWorker),
      promptInstall,
      applyUpdate,
    }),
    [deferredPrompt, isInstalled, isIOS, online, waitingWorker, promptInstall, applyUpdate]
  );

  return <PwaContext.Provider value={value}>{children}</PwaContext.Provider>;
}

export const usePwa = () => useContext(PwaContext);
