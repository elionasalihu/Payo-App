import "../styles/global/Header.css";
import { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";

import { useAuth } from "../../auth/AuthProvider";

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="payo-header">
      <div className="payo-header-inner">
       <a href="/" className="payo-logo" aria-label="Payo home">
      <span className="payo-logo-mark">
        <span />
      </span>

      <span className="payo-logo-text">pay</span> <span className="payo-logo-o">o</span> <span className="payo-logo-text">.</span>
    </a>

        <nav className="payo-nav">
          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <a href="#about">About</a>
        </nav>

        <div className="payo-header-actions">
          {user ? (
            <Link to="/client" className="payo-header-cta">
              Open dashboard
              <ArrowRight size={15} />
            </Link>
          ) : (
            <>
              <Link to="/login" className="payo-login">
                Log in
              </Link>

              <Link to="/register" className="payo-header-cta">
                Get started
                <ArrowRight size={15} />
              </Link>
            </>
          )}

          <button
            className="payo-menu-button"
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            {menuOpen ? <X size={21} /> : <Menu size={21} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className="payo-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <nav className="payo-mobile-nav">
              <a href="#features" onClick={closeMenu}>
                Features
              </a>

              <a href="#how-it-works" onClick={closeMenu}>
                How it works
              </a>

              <a href="#about" onClick={closeMenu}>
                About
              </a>
            </nav>

            <div className="payo-mobile-actions">
              {user ? (
                <Link to="/client" className="payo-mobile-cta" onClick={closeMenu}>
                  Open dashboard
                  <ArrowRight size={15} />
                </Link>
              ) : (
                <>
                  <Link to="/login" className="payo-mobile-login" onClick={closeMenu}>
                    Log in
                  </Link>

                  <Link to="/register" className="payo-mobile-cta" onClick={closeMenu}>
                    Get started
                    <ArrowRight size={15} />
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Header;