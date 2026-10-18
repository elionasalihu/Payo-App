import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MailCheck } from "lucide-react";

import AuthLayout, { FormError, friendlyAuthError } from "./AuthLayout";
import { useAuth } from "../../../auth/AuthProvider";

function ForgotPassword() {
  const { sendPasswordReset } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) {
      setError("Enter the email you signed up with.");
      return;
    }
    setSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setSent(true);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      eyebrow="RESET PASSWORD"
      title={
        <>
          Forgot your <em>password?</em>
        </>
      }
      subtitle={sent ? null : "Enter your email and we’ll send you a link to choose a new one."}
      footer={
        <>
          Remembered it? <Link to="/login">Back to log in</Link>
        </>
      }
    >
      {sent ? (
        <div className="auth-success">
          <span className="auth-success-icon">
            <MailCheck size={22} />
          </span>
          <p>
            If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way.
          </p>
        </div>
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormError message={error} />
          <label className="auth-field">
            <span>Email</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <button type="submit" className="auth-submit" disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ForgotPassword;
