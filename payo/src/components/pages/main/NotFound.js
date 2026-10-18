import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { PayoWordmark } from "../auth/AuthLayout";

function NotFound() {
  return (
    <div className="auth-page not-found">
      <div className="auth-form-side">
        <div className="auth-form-top">
          <PayoWordmark />
        </div>
        <div className="auth-card">
          <span className="auth-eyebrow">ERROR 404</span>
          <h1>
            This page doesn’t <em>exist.</em>
          </h1>
          <p className="auth-subtitle">The link may be broken, or the page may have moved.</p>
          <div className="auth-form">
            <Link to="/" className="auth-submit">
              <ArrowLeft size={16} /> Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
