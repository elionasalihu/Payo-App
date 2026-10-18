import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, MailCheck } from "lucide-react";

import AuthLayout, { FormError, friendlyAuthError } from "./AuthLayout";
import { useAuth } from "../../../auth/AuthProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Register() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const validate = () => {
    if (form.fullName.trim().length < 2) return "Enter your full name.";
    if (!EMAIL_RE.test(form.email.trim())) return "Enter a valid email address.";
    if (form.password.length < 8) return "Password must be at least 8 characters.";
    if (form.password !== form.confirm) return "Passwords don’t match.";
    return "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const problem = validate();
    setError(problem);
    if (problem) return;

    setSubmitting(true);
    try {
      const data = await signUp({
        fullName: form.fullName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      if (data.session) {
        navigate("/client", { replace: true });
      } else {
        // Email confirmation is enabled in Supabase
        setConfirmSent(true);
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmSent) {
    return (
      <AuthLayout
        eyebrow="ALMOST THERE"
        title={
          <>
            Check your <em>inbox.</em>
          </>
        }
        footer={
          <>
            Already confirmed? <Link to="/login">Log in</Link>
          </>
        }
      >
        <div className="auth-success">
          <span className="auth-success-icon">
            <MailCheck size={22} />
          </span>
          <p>
            We sent a confirmation link to <strong>{form.email.trim()}</strong>. Open it to activate
            your account, then log in.
          </p>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="GET STARTED"
      title={
        <>
          Create your <em>account.</em>
        </>
      }
      subtitle="Free to use. Set up your first group in under a minute."
      footer={
        <>
          Already have an account? <Link to="/login">Log in</Link>
        </>
      }
    >
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <FormError message={error} />

        <label className="auth-field">
          <span>Full name</span>
          <input
            type="text"
            autoComplete="name"
            placeholder="Your full name"
            value={form.fullName}
            onChange={update("fullName")}
            required
          />
        </label>

        <label className="auth-field">
          <span>Email</span>
          <input
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={update("email")}
            required
          />
        </label>

        <div className="auth-field-grid">
          <label className="auth-field">
            <span>Password</span>
            <div className="auth-password">
              <input
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={form.password}
                onChange={update("password")}
                required
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </label>

          <label className="auth-field">
            <span>Confirm password</span>
            <input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Repeat password"
              value={form.confirm}
              onChange={update("confirm")}
              required
            />
          </label>
        </div>

        <button type="submit" className="auth-submit" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
          {!submitting && <ArrowRight size={16} />}
        </button>

        <p className="auth-fineprint">By creating an account you agree to Payo’s terms and privacy policy.</p>
      </form>
    </AuthLayout>
  );
}

export default Register;
