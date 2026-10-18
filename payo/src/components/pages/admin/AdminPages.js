import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, Search, Shield, ShieldOff, Trash2, Users, UsersRound, Wallet } from "lucide-react";

import { useAdminData } from "./AdminLayout";
import { useAuth } from "../../../auth/AuthProvider";
import { useToast } from "../../sections/Toast";
import { useConfirm } from "../../sections/Confirm";
import { EmptyState, ErrorBanner, PageHeader, SkeletonRows } from "../../sections/DashboardParts";
import { adminSetRole, deleteExpense, deleteGroup } from "../../supabase/api";
import { categoryFor, friendlyDate, initials, toneFor } from "../../../lib/format";
import { formatCents, toCents } from "../../../lib/money";

const sumCents = (list) => list.reduce((s, e) => s + toCents(e.amount), 0);

function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="page-search">
      <Search size={15} />
      <input placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} aria-label={placeholder} />
    </label>
  );
}

// ---------------------------------------------------------------------
// OVERVIEW
// ---------------------------------------------------------------------

export function AdminOverview() {
  const { profiles, groups, members, expenses, settlements, loading, error, refresh, nameOf } = useAdminData();

  const months = useMemo(() => {
    const now = new Date();
    const keys = [];
    for (let i = 5; i >= 0; i -= 1) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
    }
    const totals = Object.fromEntries(keys.map((k) => [k, 0]));
    expenses.forEach((e) => {
      const k = e.expense_date.slice(0, 7);
      if (k in totals) totals[k] += toCents(e.amount);
    });
    const max = Math.max(1, ...Object.values(totals));
    return keys.map((k) => ({
      key: k,
      label: new Date(`${k}-01T00:00:00`).toLocaleDateString("en-US", { month: "short" }),
      cents: totals[k],
      pct: (totals[k] / max) * 100,
    }));
  }, [expenses]);

  const topGroups = useMemo(
    () =>
      groups
        .map((g) => ({
          ...g,
          total: sumCents(expenses.filter((e) => e.group_id === g.id)),
          memberCount: members.filter((m) => m.group_id === g.id).length,
        }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5),
    [groups, expenses, members]
  );

  const newUsers30 = profiles.filter((p) => Date.now() - new Date(p.created_at) < 30 * 86400000).length;

  const stats = [
    { label: "Users", value: profiles.length, sub: `${newUsers30} joined in the last 30 days`, icon: UsersRound },
    { label: "Groups", value: groups.length, sub: `${members.length} memberships`, icon: Users },
    { label: "Expenses", value: expenses.length, sub: `${settlements.length} payments recorded`, icon: CreditCard },
    { label: "Total volume", value: formatCents(sumCents(expenses)), sub: "All expenses ever added", icon: Wallet },
  ];

  return (
    <>
      <PageHeader
        eyebrow="ADMIN"
        title={
          <>
            Platform <strong>overview.</strong>
          </>
        }
        description="How Payo is being used across all accounts."
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <section className="admin-stats">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="dashboard-balance-card">
              <div className="dashboard-card-top">
                <span>{s.label}</span>
                <div className="dashboard-card-icon">
                  <Icon size={17} />
                </div>
              </div>
              <div className="dashboard-small-value">{loading ? "—" : s.value}</div>
              <p className="dashboard-card-description">{s.sub}</p>
            </div>
          );
        })}
      </section>

      <section className="dashboard-content-grid">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Expense volume</h2>
              <p>Last 6 months, by expense date</p>
            </div>
          </div>
          <div className="admin-chart" role="img" aria-label="Expense volume per month">
            {months.map((m) => (
              <div key={m.key} className="admin-chart-col">
                <span className="admin-chart-value">{m.cents ? formatCents(m.cents).replace(/\.\d\d$/, "") : ""}</span>
                <div className="admin-chart-track">
                  <div className="admin-chart-bar" style={{ height: `${Math.max(m.pct, m.cents ? 4 : 0)}%` }} />
                </div>
                <span className="admin-chart-label">{m.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="group-side">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Top groups</h2>
                <p>By total spent</p>
              </div>
              <Link to="/admin/groups">View all</Link>
            </div>
            <div className="dashboard-groups-list">
              {loading ? (
                <SkeletonRows count={3} />
              ) : topGroups.length === 0 ? (
                <EmptyState icon={Users} title="No groups yet" />
              ) : (
                topGroups.map((g) => (
                  <div key={g.id} className="dashboard-group-card static">
                    <div className={`dashboard-group-card-avatar tone-${toneFor(g.id)}`}>{g.name.charAt(0).toUpperCase()}</div>
                    <div className="dashboard-group-card-info">
                      <strong>{g.name}</strong>
                      <span>{g.memberCount} members</span>
                    </div>
                    <div className="dashboard-group-balance">{formatCents(g.total)}</div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Newest users</h2>
                <p>Latest sign-ups</p>
              </div>
              <Link to="/admin/users">View all</Link>
            </div>
            <div className="dashboard-groups-list">
              {profiles.slice(0, 5).map((p) => (
                <div key={p.id} className="dashboard-group-card static">
                  <div className="dashboard-group-card-avatar">{initials(p.full_name || p.email)}</div>
                  <div className="dashboard-group-card-info">
                    <strong>{nameOf(p.id)}</strong>
                    <span>{p.email}</span>
                  </div>
                  <div className="dashboard-group-balance settled">{friendlyDate(p.created_at)}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// ---------------------------------------------------------------------
// USERS
// ---------------------------------------------------------------------

export function AdminUsers() {
  const { profiles, members, expenses, loading, error, refresh } = useAdminData();
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return profiles
      .filter((p) => roleFilter === "all" || p.role === roleFilter)
      .filter((p) => !q || p.full_name.toLowerCase().includes(q) || p.email.toLowerCase().includes(q))
      .map((p) => ({
        ...p,
        groupCount: members.filter((m) => m.user_id === p.id).length,
        paidCents: sumCents(expenses.filter((e) => e.paid_by === p.id)),
      }));
  }, [profiles, members, expenses, query, roleFilter]);

  const toggleRole = async (p) => {
    const next = p.role === "admin" ? "user" : "admin";
    const ok = await confirm({
      title: next === "admin" ? `Make ${p.full_name} an admin?` : `Remove admin from ${p.full_name}?`,
      message:
        next === "admin"
          ? "Admins can see every user, group and expense, and delete content."
          : "They will lose access to the admin panel.",
      confirmLabel: next === "admin" ? "Make admin" : "Remove admin",
      danger: next !== "admin",
    });
    if (!ok) return;
    try {
      await adminSetRole(p.id, next);
      toast.success(`${p.full_name} is now ${next === "admin" ? "an admin" : "a regular user"}`);
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader eyebrow="ADMIN" title={<>All <strong>users.</strong></>} description={`${profiles.length} registered accounts`} />
      <ErrorBanner message={error} onRetry={refresh} />

      <section className="dashboard-panel page-panel">
        <div className="page-toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search by name or email" />
          <select className="pf-select page-filter" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} aria-label="Filter by role">
            <option value="all">All roles</option>
            <option value="user">Users</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <SkeletonRows count={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon={UsersRound} title="No users found" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th className="num">Groups</th>
                  <th className="num">Paid</th>
                  <th>Joined</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="admin-cell-user">
                        <span className="pf-avatar">{initials(p.full_name || p.email)}</span>
                        <div>
                          <strong>
                            {p.full_name}
                            {p.id === user?.id && <span className="admin-you">you</span>}
                          </strong>
                          <span>{p.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${p.role === "admin" ? "" : "muted"}`}>{p.role === "admin" ? "Admin" : "User"}</span>
                    </td>
                    <td className="num">{p.groupCount}</td>
                    <td className="num">{formatCents(p.paidCents)}</td>
                    <td className="muted">{friendlyDate(p.created_at)}</td>
                    <td className="actions">
                      {p.id !== user?.id && (
                        <button type="button" className="pbtn pbtn-ghost pbtn-sm" onClick={() => toggleRole(p)}>
                          {p.role === "admin" ? <ShieldOff size={14} /> : <Shield size={14} />}
                          {p.role === "admin" ? "Remove admin" : "Make admin"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------------
// GROUPS
// ---------------------------------------------------------------------

export function AdminGroups() {
  const { groups, members, expenses, loading, error, refresh, nameOf } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups
      .filter((g) => !q || g.name.toLowerCase().includes(q))
      .map((g) => {
        const gm = members.filter((m) => m.group_id === g.id);
        const ge = expenses.filter((e) => e.group_id === g.id);
        return {
          ...g,
          memberCount: gm.length,
          owner: gm.find((m) => m.role === "owner")?.user_id,
          expenseCount: ge.length,
          total: sumCents(ge),
        };
      });
  }, [groups, members, expenses, query]);

  const remove = async (g) => {
    const ok = await confirm({
      title: `Delete “${g.name}”?`,
      message: `This permanently removes the group, its ${g.memberCount} memberships and ${g.expenseCount} expenses.`,
      confirmLabel: "Delete group",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteGroup(g.id);
      toast.success("Group deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader eyebrow="ADMIN" title={<>All <strong>groups.</strong></>} description={`${groups.length} groups on Payo`} />
      <ErrorBanner message={error} onRetry={refresh} />

      <section className="dashboard-panel page-panel">
        <div className="page-toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search groups" />
        </div>

        {loading ? (
          <SkeletonRows count={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon={Users} title="No groups found" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Group</th>
                  <th>Owner</th>
                  <th className="num">Members</th>
                  <th className="num">Expenses</th>
                  <th className="num">Total</th>
                  <th>Created</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((g) => (
                  <tr key={g.id}>
                    <td>
                      <div className="admin-cell-user">
                        <span className={`pf-avatar tone-${toneFor(g.id)}`}>{g.name.charAt(0).toUpperCase()}</span>
                        <div>
                          <strong>{g.name}</strong>
                          <span>Code {g.invite_code}</span>
                        </div>
                      </div>
                    </td>
                    <td className="muted">{g.owner ? nameOf(g.owner) : "—"}</td>
                    <td className="num">{g.memberCount}</td>
                    <td className="num">{g.expenseCount}</td>
                    <td className="num">{formatCents(g.total, g.currency)}</td>
                    <td className="muted">{friendlyDate(g.created_at)}</td>
                    <td className="actions">
                      <button type="button" className="icon-btn" onClick={() => remove(g)} aria-label={`Delete ${g.name}`}>
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

// ---------------------------------------------------------------------
// EXPENSES
// ---------------------------------------------------------------------

export function AdminExpenses() {
  const { expenses, groups, groupById, loading, error, refresh, nameOf } = useAdminData();
  const toast = useToast();
  const confirm = useConfirm();
  const [query, setQuery] = useState("");
  const [groupFilter, setGroupFilter] = useState("all");

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return expenses.filter(
      (e) => (groupFilter === "all" || e.group_id === groupFilter) && (!q || e.description.toLowerCase().includes(q))
    );
  }, [expenses, query, groupFilter]);

  const remove = async (e) => {
    const ok = await confirm({
      title: "Delete expense?",
      message: `“${e.description}” (${formatCents(toCents(e.amount))}) will be removed and balances in “${groupById[e.group_id]?.name}” will update.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteExpense(e.id);
      toast.success("Expense deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        eyebrow="ADMIN"
        title={<>All <strong>expenses.</strong></>}
        description={`${rows.length} expenses · ${formatCents(sumCents(rows))}`}
      />
      <ErrorBanner message={error} onRetry={refresh} />

      <section className="dashboard-panel page-panel">
        <div className="page-toolbar">
          <SearchBox value={query} onChange={setQuery} placeholder="Search expenses" />
          <select className="pf-select page-filter" value={groupFilter} onChange={(e) => setGroupFilter(e.target.value)} aria-label="Filter by group">
            <option value="all">All groups</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <SkeletonRows count={6} />
        ) : rows.length === 0 ? (
          <EmptyState icon={CreditCard} title="No expenses found" />
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Expense</th>
                  <th>Group</th>
                  <th>Paid by</th>
                  <th className="num">Split</th>
                  <th className="num">Amount</th>
                  <th>Date</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {rows.map((e) => {
                  const Icon = categoryFor(e.category).icon;
                  return (
                    <tr key={e.id}>
                      <td>
                        <div className="admin-cell-user">
                          <span className="pf-avatar">
                            <Icon size={14} />
                          </span>
                          <div>
                            <strong>{e.description}</strong>
                            <span>{categoryFor(e.category).label}</span>
                          </div>
                        </div>
                      </td>
                      <td className="muted">{groupById[e.group_id]?.name || "—"}</td>
                      <td className="muted">{nameOf(e.paid_by)}</td>
                      <td className="num">{(e.splits || []).length} people</td>
                      <td className="num strong">{formatCents(toCents(e.amount))}</td>
                      <td className="muted">{friendlyDate(e.expense_date)}</td>
                      <td className="actions">
                        <button type="button" className="icon-btn" onClick={() => remove(e)} aria-label={`Delete ${e.description}`}>
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
