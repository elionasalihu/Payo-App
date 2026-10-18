import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { AlertTriangle, Check } from "lucide-react";

import { isSupabaseConfigured } from "../../supabase/client";
import "../../styles/auth/Auth.css";

export function PayoWordmark({ to = "/" }) {
  return (
    <Link to={to} className="auth-logo" aria-label="Payo home">
      <span>pay</span>
      <span className="payo-logo-o">o</span>
      <span>.</span>
    </Link>
  );
}

const points = [
  "Groups for trips, rent, dinners and more",
  "Automatic, cent-accurate splits",
  "One tap to see who owes whom",
];

function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="auth-page">
      <div className="auth-form-side">
        <div className="auth-form-top">
          <PayoWordmark />
        </div>

        <motion.div
          className="auth-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          {!isSupabaseConfigured && (
            <div className="auth-alert auth-alert-warning">
              <AlertTriangle size={16} />
              <span>
                Supabase isn’t configured yet. Add <code>REACT_APP_SUPABASE_URL</code> and{" "}
                <code>REACT_APP_SUPABASE_ANON_KEY</code> to <code>.env.local</code> and restart.
              </span>
            </div>
          )}

          {eyebrow && <span className="auth-eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}

          {children}
        </motion.div>

        {footer && <div className="auth-footer">{footer}</div>}
      </div>

      <aside className="auth-visual-side" aria-hidden="true">
        <div className="auth-visual-inner">
          <span className="auth-visual-kicker">PAY TOGETHER. STAY ORGANIZED.</span>
          <h2>
            Shared money,
            <br />
            <em>without the awkward math.</em>
          </h2>

          <ul className="auth-visual-points">
            {points.map((p) => (
              <li key={p}>
                <span>
                  <Check size={13} strokeWidth={2.4} />
                </span>
                {p}
              </li>
            ))}
          </ul>

          <div className="auth-visual-card">
            <div className="auth-visual-card-row">
              <span>Weekend in Prizren</span>
              <strong>€642.80</strong>
            </div>
            <div className="auth-visual-bar">
              <span style={{ width: "62%" }} />
            </div>
            <div className="auth-visual-card-row small">
              <span>Arta pays Dren</span>
              <strong className="green">€48.20</strong>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="auth-alert auth-alert-error" role="alert">
      <AlertTriangle size={16} />
      <span>{message}</span>
    </div>
  );
}

export function friendlyAuthError(error) {
  const msg = (error?.message || "").toLowerCase();
  if (msg.includes("invalid login credentials")) return "That email and password don’t match. Try again.";
  if (msg.includes("email not confirmed")) return "Please confirm your email first. Check your inbox for the link.";
  if (msg.includes("user already registered")) return "An account with this email already exists. Try logging in.";
  if (msg.includes("password should be at least")) return "Password must be at least 8 characters.";
  if (msg.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  if (msg.includes("failed to fetch")) return "Can’t reach the server. Check your connection.";
  return error?.message || "Something went wrong. Please try again.";
}

export default AuthLayout;
