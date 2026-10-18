import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity as ActivityIcon, HandCoins, UserPlus } from "lucide-react";

import { useWorkspace } from "../../sections/Workspace";
import { EmptyState, ErrorBanner, PageHeader, SkeletonRows } from "../../sections/DashboardParts";
import { categoryFor, friendlyDate } from "../../../lib/format";
import { expenseImpact } from "../../../lib/balances";
import { formatCents, toCents } from "../../../lib/money";

const FILTERS = [
  { value: "all", label: "All" },
  { value: "expense", label: "Expenses" },
  { value: "payment", label: "Payments" },
  { value: "member", label: "Members" },
];

const timeOf = (iso) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

function Activity() {
  const { groups, members, expenses, settlements, loading, error, refresh, userId, memberName } = useWorkspace();
  const [filter, setFilter] = useState("all");

  const groupName = (id) => groups.find((g) => g.id === id)?.name || "a group";

  const items = useMemo(() => {
    const list = [];

    expenses.forEach((e) => {
      const impact = expenseImpact(e, userId);
      list.push({
        id: `e-${e.id}`,
        kind: "expense",
        at: e.created_at,
        groupId: e.group_id,
        icon: categoryFor(e.category).icon,
        text: (
          <>
            <b>{memberName(e.created_by || e.paid_by)}</b> added <b>“{e.description}”</b> in{" "}
            <Link to={`/client/groups/${e.group_id}`}>{groupName(e.group_id)}</Link>
          </>
        ),
        amount: formatCents(toCents(e.amount)),
        detail:
          impact > 0
            ? { text: `you lent ${formatCents(impact)}`, cls: "dashboard-positive" }
            : impact < 0
            ? { text: `you owe ${formatCents(-impact)}`, cls: "dashboard-negative" }
            : { text: "not involved", cls: "" },
      });
    });

    settlements.forEach((s) => {
      list.push({
        id: `s-${s.id}`,
        kind: "payment",
        at: s.created_at,
        groupId: s.group_id,
        icon: HandCoins,
        tone: "tone-green",
        text: (
          <>
            <b>{memberName(s.from_user)}</b> paid <b>{memberName(s.to_user)}</b> in{" "}
            <Link to={`/client/groups/${s.group_id}`}>{groupName(s.group_id)}</Link>
          </>
        ),
        amount: formatCents(toCents(s.amount)),
        detail:
          s.to_user === userId
            ? { text: "you received", cls: "dashboard-positive" }
            : s.from_user === userId
            ? { text: "you paid", cls: "" }
            : null,
      });
    });

    members.forEach((m) => {
      list.push({
        id: `m-${m.group_id}-${m.user_id}`,
        kind: "member",
        at: m.joined_at,
        groupId: m.group_id,
        icon: UserPlus,
        tone: "tone-blue",
        text: (
          <>
            <b>{memberName(m.user_id)}</b> {m.role === "owner" ? "created" : "joined"}{" "}
            <Link to={`/client/groups/${m.group_id}`}>{groupName(m.group_id)}</Link>
          </>
        ),
      });
    });

    return list.sort((a, b) => new Date(b.at) - new Date(a.at));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expenses, settlements, members, groups, userId, memberName]);

  const visible = filter === "all" ? items : items.filter((i) => i.kind === filter);

  // Group by day
  const days = [];
  visible.forEach((item) => {
    const label = friendlyDate(item.at);
    const last = days[days.length - 1];
    if (last && last.label === label) last.items.push(item);
    else days.push({ label, items: [item] });
  });

  return (
    <>
      <PageHeader
        eyebrow="ACTIVITY"
        title={
          <>
            Recent <strong>activity.</strong>
          </>
        }
        description="Everything that happened across your groups."
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <section className="dashboard-panel page-panel">
        <div className="page-toolbar">
          <div className="pf-segment">
            {FILTERS.map((f) => (
              <button key={f.value} type="button" className={filter === f.value ? "active" : ""} onClick={() => setFilter(f.value)}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <SkeletonRows count={6} />
        ) : visible.length === 0 ? (
          <EmptyState icon={ActivityIcon} title="Nothing here yet" text="Activity from your groups will show up here." />
        ) : (
          days.map((day) => (
            <div key={day.label} className="page-month">
              <div className="page-month-label">
                <span>{day.label}</span>
              </div>
              <ul className="activity-feed">
                {day.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.id} className="activity-item">
                      <span className={`dashboard-expense-icon ${item.tone || ""}`}>
                        <Icon size={16} />
                      </span>
                      <div className="activity-item-body">
                        <p>{item.text}</p>
                        <span>
                          {timeOf(item.at)}
                          {item.detail && (
                            <>
                              {" · "}
                              <em className={item.detail.cls}>{item.detail.text}</em>
                            </>
                          )}
                        </span>
                      </div>
                      {item.amount && <strong className="activity-item-amount">{item.amount}</strong>}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </section>
    </>
  );
}

export default Activity;
