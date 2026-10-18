import { Link, NavLink } from "react-router-dom";
import { motion } from "motion/react";
import { LogOut, Plus, Settings, Shield, LayoutDashboard } from "lucide-react";

import { useAuth } from "../../auth/AuthProvider";
import { initials, toneFor } from "../../lib/format";
import { InstallAppButton } from "../../pwa/PwaUI";

import "../styles/global/DashboardSidebar.css";

function Wordmark({ to }) {
  return (
    <Link to={to} className="dashboard-sidebar-logo" aria-label="Payo dashboard">
      <span>
        <span>pay</span>
        <span className="payo-logo-o">o</span>
        <span className="payo-logo-text">.</span>
      </span>
    </Link>
  );
}

/**
 * Shared sidebar for the client and admin areas.
 *
 * navigation: [{ label, icon, to, end }]
 * groups:     [{ id, name, memberCount }]  (client only)
 * onAdd:      primary action handler (client only)
 */
function DashboardSidebar({
  navigation,
  groups = [],
  onAdd,
  addLabel = "Add expense",
  variant = "client",
  homeTo = "/client",
}) {
  const { profile, user, isAdmin, signOut } = useAuth();

  const name = profile?.full_name || user?.email || "";
  const email = profile?.email || user?.email || "";

  return (
    <>
      {/* DESKTOP / TABLET SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div className="dashboard-sidebar-top">
          <Wordmark to={homeTo} />
          {variant === "admin" && <span className="dashboard-sidebar-badge">Admin</span>}
        </div>

        <div className="dashboard-sidebar-content">
          <div className="dashboard-sidebar-section">
            <span className="dashboard-sidebar-label">
              {variant === "admin" ? "Administration" : "Workspace"}
            </span>

            <nav className="dashboard-sidebar-nav">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) => `dashboard-sidebar-link ${isActive ? "active" : ""}`}
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <motion.span
                            layoutId={`${variant}-active-indicator`}
                            className="dashboard-sidebar-active"
                          />
                        )}
                        <Icon size={17} strokeWidth={1.8} />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {onAdd && (
            <button type="button" className="dashboard-sidebar-create" onClick={onAdd}>
              <span className="dashboard-sidebar-create-icon">
                <Plus size={16} strokeWidth={2.2} />
              </span>
              <span>{addLabel}</span>
            </button>
          )}

          {variant === "client" && (
            <div className="dashboard-sidebar-section dashboard-sidebar-groups">
              <span className="dashboard-sidebar-label">Your groups</span>

              <div className="dashboard-sidebar-group-list">
                {groups.length === 0 && (
                  <p className="dashboard-sidebar-empty">No groups yet. Create one to start splitting.</p>
                )}

                {groups.slice(0, 6).map((group) => (
                  <NavLink
                    key={group.id}
                    to={`/client/groups/${group.id}`}
                    className={({ isActive }) => `dashboard-sidebar-group ${isActive ? "active" : ""}`}
                  >
                    <span className={`dashboard-group-avatar tone-${toneFor(group.id)}`}>
                      {group.name.charAt(0).toUpperCase()}
                    </span>
                    <span className="dashboard-group-info">
                      <strong>{group.name}</strong>
                      <small>
                        {group.memberCount} member{group.memberCount === 1 ? "" : "s"}
                      </small>
                    </span>
                  </NavLink>
                ))}

                {groups.length > 6 && (
                  <Link to="/client/groups" className="dashboard-sidebar-more">
                    View all {groups.length} groups
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-sidebar-bottom">
          <InstallAppButton className="dashboard-sidebar-settings" />
          {variant === "client" ? (
            <>
              {isAdmin && (
                <NavLink to="/admin" className="dashboard-sidebar-settings">
                  <Shield size={17} strokeWidth={1.8} />
                  <span>Admin panel</span>
                </NavLink>
              )}
              <NavLink
                to="/client/settings"
                className={({ isActive }) => `dashboard-sidebar-settings ${isActive ? "active" : ""}`}
              >
                <Settings size={17} strokeWidth={1.8} />
                <span>Settings</span>
              </NavLink>
            </>
          ) : (
            <NavLink to="/client" className="dashboard-sidebar-settings">
              <LayoutDashboard size={17} strokeWidth={1.8} />
              <span>Back to app</span>
            </NavLink>
          )}

          <div className="dashboard-sidebar-profile">
            <div className="dashboard-profile-avatar">{initials(name)}</div>

            <div className="dashboard-profile-info">
              <strong>{name}</strong>
              <span>{email}</span>
            </div>

            <button
              type="button"
              className="dashboard-sidebar-signout"
              onClick={signOut}
              aria-label="Sign out"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="dashboard-mobile-topbar">
        <Wordmark to={homeTo} />
        <div className="dashboard-mobile-topbar-actions">
          <InstallAppButton className="dashboard-mobile-icon" compact />
          {variant === "client" && isAdmin && (
            <Link to="/admin" className="dashboard-mobile-icon" aria-label="Admin panel">
              <Shield size={18} />
            </Link>
          )}
          {variant === "admin" && (
            <Link to="/client" className="dashboard-mobile-icon" aria-label="Back to app">
              <LayoutDashboard size={18} />
            </Link>
          )}
          <Link
            to="/client/settings"
            className="dashboard-profile-avatar"
            aria-label="Settings"
          >
            {initials(name)}
          </Link>
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <nav className="dashboard-mobile-nav">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `dashboard-mobile-nav-item ${isActive ? "active" : ""}`}
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.7} />
                  <span>{item.mobileLabel || item.label}</span>
                </>
              )}
            </NavLink>
          );
        })}

        {onAdd && (
          <button type="button" className="dashboard-mobile-nav-add" onClick={onAdd} aria-label={addLabel}>
            <Plus size={20} strokeWidth={2.2} />
          </button>
        )}
      </nav>
    </>
  );
}

export default DashboardSidebar;
