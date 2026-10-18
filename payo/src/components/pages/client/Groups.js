import { Link } from "react-router-dom";
import { ChevronRight, LogIn, Plus, Users } from "lucide-react";

import { useWorkspace } from "../../sections/Workspace";
import { EmptyState, ErrorBanner, PageHeader, SkeletonRows } from "../../sections/DashboardParts";
import { initials, toneFor } from "../../../lib/format";
import { formatCents } from "../../../lib/money";

function Groups() {
  const { groups, summary, loading, error, refresh, userId, openGroupModal } = useWorkspace();

  return (
    <>
      <PageHeader
        eyebrow="GROUPS"
        title={
          <>
            Your <strong>groups.</strong>
          </>
        }
        description="Trips, flats, teams — every shared space in one place."
        actions={
          <>
            <button className="pbtn pbtn-ghost" onClick={() => openGroupModal("join")}>
              <LogIn size={15} />
              <span className="hide-sm">Join with code</span>
            </button>
            <button className="dashboard-header-add" onClick={() => openGroupModal("create")}>
              <Plus size={16} />
              New group
            </button>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      {loading ? (
        <div className="dashboard-panel page-panel">
          <SkeletonRows count={4} />
        </div>
      ) : groups.length === 0 ? (
        <div className="dashboard-panel page-panel">
          <EmptyState
            icon={Users}
            title="You’re not in any groups yet"
            text="Create a group and invite friends, or join an existing one with its invite code."
            action={
              <div className="page-empty-actions">
                <button type="button" className="pbtn pbtn-primary pbtn-sm" onClick={() => openGroupModal("create")}>
                  <Plus size={14} /> Create group
                </button>
                <button type="button" className="pbtn pbtn-ghost pbtn-sm" onClick={() => openGroupModal("join")}>
                  <LogIn size={14} /> Join with code
                </button>
              </div>
            }
          />
        </div>
      ) : (
        <section className="group-grid">
          {groups.map((group) => {
            const info = summary.byGroup[group.id];
            const net = info?.myNet || 0;
            const others = info?.members || [];
            const owner = others.find((m) => m.role === "owner");
            return (
              <Link key={group.id} to={`/client/groups/${group.id}`} className="group-tile">
                <div className="group-tile-top">
                  <span className={`group-tile-avatar tone-${toneFor(group.id)}`}>{group.name.charAt(0).toUpperCase()}</span>
                  <ChevronRight size={16} className="group-tile-chevron" />
                </div>

                <strong className="group-tile-name">{group.name}</strong>
                <p className="group-tile-desc">
                  {group.description || (owner?.user_id === userId ? "You created this group" : `Created by ${owner?.profile?.full_name || "a member"}`)}
                </p>

                <div className="avatar-stack">
                  {others.slice(0, 4).map((m) => (
                    <span key={m.user_id} title={m.profile?.full_name}>
                      {initials(m.profile?.full_name || m.profile?.email)}
                    </span>
                  ))}
                  {others.length > 4 && <span>+{others.length - 4}</span>}
                </div>

                <div className="group-tile-foot">
                  <div>
                    <span>Total spent</span>
                    <strong>{formatCents(info?.totalCents || 0, group.currency)}</strong>
                  </div>
                  <div className="right">
                    <span>{net > 0 ? "You are owed" : net < 0 ? "You owe" : "Your balance"}</span>
                    <strong className={net > 0 ? "dashboard-positive" : net < 0 ? "dashboard-negative" : ""}>
                      {net === 0 ? "Settled" : formatCents(Math.abs(net), group.currency)}
                    </strong>
                  </div>
                </div>
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}

export default Groups;
