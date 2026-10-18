import { Link } from "react-router-dom";

import "../styles/global/Footer.css";

function Logo() {
  return (
    <Link to="/" className="payo-logo" aria-label="Payo home">
      <span className="payo-logo-mark">
        <span />
      </span>

      <span className="payo-logo-text">pay</span> <span className="payo-logo-o">o</span> <span className="payo-logo-text">.</span>
    </Link>
  );
}

function Footer() {
  return (
    <footer className="payo-footer" id="about">
      <div className="payo-footer-main">
        <div className="payo-footer-brand">
          <Logo />

          <p>
            Pay together.
            <br />
            Stay organized.
          </p>
        </div>

        <div className="payo-footer-column">
          <span>Product</span>

          <a href="#features">Features</a>
          <a href="#how-it-works">How it works</a>
          <Link to="/register">Get started</Link>
        </div>

        <div className="payo-footer-column">
          <span>Company</span>

          <a href="#about">About</a>
          <Link to="/privacy">Privacy</Link>
          <Link to="/terms">Terms</Link>
        </div>

        <div className="payo-footer-column">
          <span>Account</span>

          <Link to="/login">Log in</Link>
          <Link to="/register">Sign up</Link>
        </div>
      </div>

      <div className="payo-footer-bottom">
        <span>© 2026 Payo. All rights reserved.</span>

        <span>University degree project.</span>
      </div>
    </footer>
  );
}

export default Footer;