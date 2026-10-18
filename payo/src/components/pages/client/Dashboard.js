import { Link } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  ExternalLink,
  Plus,
  ReceiptText,
  Trash2,
  Users,
} from "lucide-react";

import { useAuth } from "../../../auth/AuthProvider";
import { useWorkspace } from "../../sections/Workspace";
import { useToast } from "../../sections/Toast";
import { useConfirm } from "../../sections/Confirm";
import { EmptyState, ErrorBanner, ExpenseRow, SkeletonRows } from "../../sections/DashboardParts";
import { deleteExpense } from "../../supabase/api";
import { firstName, greeting, toneFor } from "../../../lib/format";
import { formatCents } from "../../../lib/money";

export function useExpenseActions() {
  const { userId, refresh, summary } = useWorkspace();
  const toast = useToast();
  const confirm = useConfirm();

  const canDelete = (expense) =>
    expense.created_by === userId ||
    expense.paid_by === userId ||
    summary.byGroup[expense.group_id]?.members.some((m) => m.user_id === userId && m.role === "owner");

  const remove = async (expense) => {
    const ok = await confirm({
      title: "Delete expense?",
      message: `“${expense.description}” will be removed for everyone in the group and balances will update.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteExpense(expense.id);
      toast.success("Expense deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const menuFor = (expense, { showGroupLink = true } = {}) => [
    showGroupLink && { label: "Open group", icon: ExternalLink, to: `/client/groups/${expense.group_id}` },
    canDelete(expense) && { label: "Delete", icon: Trash2, danger: true, onClick: () => remove(expense) },
  ];

  return { canDelete, remove, menuFor };
}

function Dashboard() {
  const { profile } = useAuth();
  const { groups, expenses, summary, loading, error, refresh, userId, memberName, openAddExpense, openGroupModal } =
    useWorkspace();
  const { menuFor } = useExpenseActions();

  const groupName = (id) => groups.find((g) => g.id === id)?.name;
  const recent = expenses.slice(0, 5);

  const total = summary.totalCents;
  const settledGroups = groups.length - summary.oweGroups - summary.owedGroups;

  return (
    <>
      {/* Header */}
      <header className="dashboard-header">
        <div>
          <span className="dashboard-eyebrow">OVERVIEW</span>

          <h1>
            {greeting()}, <strong>{firstName(profile?.full_name)}.</strong>
          </h1>

          <p>Here’s what’s happening with your shared expenses.</p>
        </div>

        <button className="dashboard-header-add" onClick={() => openAddExpense()}>
          <Plus size={16} />
          Add expense
        </button>
      </header>

      <ErrorBanner message={error} onRetry={refresh} />

      {/* Balance cards */}
      <section className="dashboard-balance-grid">
        <div className="dashboard-balance-card dashboard-balance-main">
          <div className="dashboard-card-top">
            <span>Total balance</span>

            <div className="dashboard-card-icon">
              <ReceiptText size={17} />
            </div>
          </div>

          <div className="dashboard-balance-value">{loading ? "—" : formatCents(total, "EUR", { sign: true })}</div>

          <div className="dashboard-balance-footer">
            {total > 0 && (
              <span className="dashboard-positive">
                <ArrowDownLeft size={13} />
                You are owed overall
              </span>
            )}
            {total < 0 && (
              <span className="dashboard-negative-light">
                <ArrowUpRight size={13} />
                You owe overall
              </span>
            )}
            {total === 0 && <span className="dashboard-positive">All settled up</span>}
            <span>
              across {groups.length} group{groups.length === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>You owe</span>

            <div className="dashboard-card-icon dashboard-card-icon-red">
              <ArrowUpRight size={17} />
            </div>
          </div>

          <div className="dashboard-small-value">{loading ? "—" : formatCents(summary.oweCents)}</div>

          <p className="dashboard-card-description">
            {summary.oweGroups ? `Across ${summary.oweGroups} group${summary.oweGroups === 1 ? "" : "s"}` : "Nothing to pay back"}
          </p>
        </div>

        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>You are owed</span>

            <div className="dashboard-card-icon dashboard-card-icon-green">
              <ArrowDownLeft size={17} />
            </div>
          </div>

          <div className="dashboard-small-value">{loading ? "—" : formatCents(summary.owedCents)}</div>

          <p className="dashboard-card-description">
            {summary.owedGroups
              ? `Across ${summary.owedGroups} group${summary.owedGroups === 1 ? "" : "s"}`
              : settledGroups > 0
              ? "Nobody owes you right now"
              : "Nothing yet"}
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="dashboard-content-grid">
        {/* Recent expenses */}
        <div className="dashboard-panel dashboard-expenses-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Recent expenses</h2>
              <p>Your latest shared expenses</p>
            </div>

            <Link to="/client/expenses">
              View all
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="dashboard-expense-list">
            {loading ? (
              <SkeletonRows />
            ) : recent.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No expenses yet"
                text={groups.length ? "Add the first expense to one of your groups." : "Create a group first, then add expenses to it."}
                action={
                  <button
                    type="button"
                    className="pbtn pbtn-primary pbtn-sm"
                    onClick={() => (groups.length ? openAddExpense() : openGroupModal("create"))}
                  >
                    <Plus size={14} />
                    {groups.length ? "Add expense" : "Create a group"}
                  </button>
                }
              />
            ) : (
              recent.map((expense) => (
                <ExpenseRow
                  key={expense.id}
                  expense={expense}
                  userId={userId}
                  groupName={groupName(expense.group_id)}
                  memberName={memberName}
                  menuItems={menuFor(expense)}
                />
              ))
            )}
          </div>
        </div>

        {/* Groups */}
        <div className="dashboard-panel dashboard-groups-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>Your groups</h2>
              <p>Where your money is shared</p>
            </div>

            <Link to="/client/groups">
              View all
              <ChevronRight size={14} />
            </Link>
          </div>

          <div className="dashboard-groups-list">
            {loading ? (
              <SkeletonRows count={3} />
            ) : groups.length === 0 ? (
              <EmptyState icon={Users} title="No groups yet" text="Groups keep expenses for a trip, flat or team together." />
            ) : (
              groups.slice(0, 5).map((group) => {
                const info = summary.byGroup[group.id];
                const net = info?.myNet || 0;
                return (
                  <Link to={`/client/groups/${group.id}`} className="dashboard-group-card" key={group.id}>
                    <div className={`dashboard-group-card-avatar tone-${toneFor(group.id)}`}>
                      {group.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="dashboard-group-card-info">
                      <strong>{group.name}</strong>

                      <span>
                        <Users size={12} />
                        {info?.members.length || 0} members
                      </span>
                    </div>

                    <div className={`dashboard-group-balance ${net > 0 ? "positive" : net < 0 ? "negative" : "settled"}`}>
                      {net === 0 ? "Settled" : formatCents(net, group.currency, { sign: true })}
                    </div>

                    <ChevronRight className="dashboard-group-chevron" size={15} />
                  </Link>
                );
              })
            )}
          </div>

          <button className="dashboard-new-group" onClick={() => openGroupModal("create")}>
            <Plus size={15} />
            Create new group
          </button>
        </div>
      </section>
    </>
  );
}

export default Dashboard;
