import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

import AuthLayout, { FormError, friendlyAuthError } from "./AuthLayout";
import { useAuth } from "../../../auth/AuthProvider";
import { updatePassword } from "../../supabase/api";

function ResetPassword() {
  const { user, loading, setRecovering } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (password !== confirm) return setError("Passwords don’t match.");
    setError("");
    setSubmitting(true);
    try {
      await updatePassword(password);
      setRecovering(false);
      navigate("/client", { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
      setSubmitting(false);
    }
  };

  const linkInvalid = !loading && !user;

  return (
    <AuthLayout
      eyebrow="NEW PASSWORD"
      title={
        <>
          Choose a new <em>password.</em>
        </>
      }
      footer={<Link to="/login">Back to log in</Link>}
    >
      {linkInvalid ? (
        <FormError message="This reset link is invalid or has expired. Request a new one from the login page." />
      ) : (
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <FormError message={error} />
          <label className="auth-field">
            <span>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          <label className="auth-field">
            <span>Confirm new password</span>
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </label>
          <button type="submit" className="auth-submit" disabled={submitting || loading}>
            {submitting ? "Saving…" : "Save password"}
            {!submitting && <ArrowRight size={16} />}
          </button>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPassword;
