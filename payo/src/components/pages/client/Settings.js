import { useEffect, useState } from "react";
import { KeyRound, LogOut, Shield, User } from "lucide-react";

import { useAuth } from "../../../auth/AuthProvider";
import { useToast } from "../../sections/Toast";
import { PageHeader } from "../../sections/DashboardParts";
import { updatePassword, updateProfileName } from "../../supabase/api";
import { initials } from "../../../lib/format";
import { InstallAppCard } from "../../../pwa/PwaUI";

function Settings() {
  const { user, profile, setProfile, signOut, isAdmin } = useAuth();
  const toast = useToast();

  const [name, setName] = useState(profile?.full_name || "");
  const [savingName, setSavingName] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    setName(profile?.full_name || "");
  }, [profile?.full_name]);

  const saveName = async (e) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      toast.error("Name must be at least 2 characters.");
      return;
    }
    setSavingName(true);
    try {
      const updated = await updateProfileName(user.id, name.trim());
      setProfile(updated);
      toast.success("Profile updated");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingName(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwError("");
    if (password.length < 8) return setPwError("Password must be at least 8 characters.");
    if (password !== confirm) return setPwError("Passwords don’t match.");
    setSavingPw(true);
    try {
      await updatePassword(password);
      setPassword("");
      setConfirm("");
      toast.success("Password changed");
    } catch (err) {
      setPwError(err.message);
    } finally {
      setSavingPw(false);
    }
  };

  const joined = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : null;

  return (
    <>
      <PageHeader
        eyebrow="SETTINGS"
        title={
          <>
            Your <strong>account.</strong>
          </>
        }
        description="Manage your profile and sign-in details."
      />

      <div className="settings-grid">
        <section className="dashboard-panel settings-card">
          <div className="settings-profile">
            <span className="settings-avatar">{initials(profile?.full_name || user?.email)}</span>
            <div>
              <strong>{profile?.full_name}</strong>
              <span>{user?.email}</span>
              <div className="settings-badges">
                <span className="badge">{isAdmin ? <><Shield size={11} /> Admin</> : "Member"}</span>
                {joined && <span className="badge muted">Joined {joined}</span>}
              </div>
            </div>
          </div>
        </section>

        <section className="dashboard-panel settings-card">
          <div className="dashboard-panel-header">
            <div>
              <h2>
                <User size={14} /> Profile
              </h2>
              <p>This is how other members see you</p>
            </div>
          </div>
          <form className="pf-form settings-form" onSubmit={saveName}>
            <label className="pf-field">
              <span className="pf-label">Full name</span>
              <input className="pf-input" value={name} maxLength={60} onChange={(e) => setName(e.target.value)} />
            </label>
            <label className="pf-field">
              <span className="pf-label">Email</span>
              <input className="pf-input" value={user?.email || ""} disabled />
            </label>
            <div>
              <button type="submit" className="pbtn pbtn-primary" disabled={savingName || name.trim() === profile?.full_name}>
                {savingName ? "Saving…" : "Save changes"}
              </button>
            </div>
          </form>
        </section>

        <section className="dashboard-panel settings-card">
          <div className="dashboard-panel-header">
            <div>
              <h2>
                <KeyRound size={14} /> Password
              </h2>
              <p>Use at least 8 characters</p>
            </div>
          </div>
          <form className="pf-form settings-form" onSubmit={savePassword} noValidate>
            {pwError && <div className="pf-error" role="alert">{pwError}</div>}
            <div className="pf-row">
              <label className="pf-field">
                <span className="pf-label">New password</span>
                <input className="pf-input" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
              </label>
              <label className="pf-field">
                <span className="pf-label">Confirm</span>
                <input className="pf-input" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
              </label>
            </div>
            <div>
              <button type="submit" className="pbtn pbtn-primary" disabled={savingPw || !password}>
                {savingPw ? "Saving…" : "Change password"}
              </button>
            </div>
          </form>
        </section>

        <InstallAppCard />

        <section className="dashboard-panel settings-card">
          <div className="dashboard-panel-header">
            <div>
              <h2>
                <LogOut size={14} /> Sign out
              </h2>
              <p>Sign out of Payo on this device</p>
            </div>
            <button type="button" className="pbtn pbtn-danger pbtn-sm" onClick={signOut}>
              Sign out
            </button>
          </div>
        </section>
      </div>
    </>
  );
}

export default Settings;
