import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Download, RefreshCw, Share, SquarePlus, WifiOff } from "lucide-react";

import Modal from "../components/sections/Modal";
import { usePwa } from "./PwaProvider";

import "./Pwa.css";

/** Banners shown app-wide: offline notice + "new version available". */
export function PwaBanners() {
  const { online, updateReady, applyUpdate } = usePwa();

  return (
    <div className="pwa-banners" aria-live="polite">
      <AnimatePresence>
        {!online && (
          <motion.div
            key="offline"
            className="pwa-banner offline"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <WifiOff size={15} />
            You’re offline. Showing the app; new changes will need a connection.
          </motion.div>
        )}
        {updateReady && (
          <motion.div
            key="update"
            className="pwa-banner update"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <RefreshCw size={15} />
            A new version of Payo is ready.
            <button type="button" onClick={applyUpdate}>
              Reload
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * "Install app" button. Uses the browser prompt where available (Chrome/Edge/Android),
 * shows Add-to-Home-Screen instructions on iPhone/iPad, hides itself when installed.
 */
export function InstallAppButton({ className = "", label = "Install app", compact = false }) {
  const { canInstall, showIOSHint, promptInstall } = usePwa();
  const [iosOpen, setIosOpen] = useState(false);

  if (!canInstall && !showIOSHint) return null;

  const onClick = () => (canInstall ? promptInstall() : setIosOpen(true));

  return (
    <>
      <button type="button" className={className} onClick={onClick} aria-label={label} title={label}>
        <Download size={compact ? 18 : 17} strokeWidth={1.8} />
        {!compact && <span>{label}</span>}
      </button>

      <Modal open={iosOpen} onClose={() => setIosOpen(false)} title="Install Payo on your iPhone" width={420}>
        <ol className="pwa-ios-steps">
          <li>
            <span className="pwa-step-icon">
              <Share size={16} />
            </span>
            Tap the <b>Share</b> button in Safari’s toolbar.
          </li>
          <li>
            <span className="pwa-step-icon">
              <SquarePlus size={16} />
            </span>
            Choose <b>Add to Home Screen</b>.
          </li>
          <li>
            <span className="pwa-step-icon">p.</span>
            Tap <b>Add</b>. Payo opens full-screen like a normal app.
          </li>
        </ol>
      </Modal>
    </>
  );
}

/** Card for the Settings page that explains install status. */
export function InstallAppCard() {
  const { canInstall, showIOSHint, isInstalled } = usePwa();

  return (
    <section className="dashboard-panel settings-card">
      <div className="dashboard-panel-header">
        <div>
          <h2>
            <Download size={14} /> Install the app
          </h2>
          <p>
            {isInstalled
              ? "Payo is installed on this device."
              : canInstall || showIOSHint
              ? "Add Payo to your home screen for one-tap access, full-screen and offline start."
              : "Open Payo in Chrome, Edge or Safari on your phone to install it."}
          </p>
        </div>
        {isInstalled ? (
          <span className="badge">Installed</span>
        ) : (
          <InstallAppButton className="pbtn pbtn-primary pbtn-sm" label="Install" />
        )}
      </div>
    </section>
  );
}
