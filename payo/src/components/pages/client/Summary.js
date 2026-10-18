import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  ReceiptText,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";

import { useWorkspace } from "../../sections/Workspace";
import { EmptyState, ErrorBanner, ExpenseRow, PageHeader, SkeletonRows } from "../../sections/DashboardParts";
import { useExpenseActions } from "./Dashboard";
import { categoryFor, toneFor } from "../../../lib/format";
import { formatCents } from "../../../lib/money";
import { monthKeyOf, monthLabel, monthlySummary, shiftMonth } from "../../../lib/summary";

const short = (cents) => formatCents(cents).replace(/\.00$/, "");

function Summary() {
  const { groups, expenses, settlements, loading, error, refresh, userId, memberName } = useWorkspace();
  const { menuFor } = useExpenseActions();

  const currentKey = monthKeyOf(new Date());
  const [monthKey, setMonthKey] = useState(currentKey);
  const [groupId, setGroupId] = useState("all");
  const [metric, setMetric] = useState("share"); // share | total

  const s = useMemo(
    () => monthlySummary({ groups, expenses, settlements }, userId, monthKey, groupId),
    [groups, expenses, settlements, userId, monthKey, groupId]
  );

  const catValue = (c) => (metric === "share" ? c.shareCents : c.totalCents);
  const catMax = Math.max(1, ...s.categories.map(catValue));
  const trendMax = Math.max(1, ...s.trend.map((t) => t.shareCents));
  const groupName = (id) => groups.find((g) => g.id === id)?.name;

  return (
    <>
      <PageHeader
        eyebrow="MONTHLY SUMMARY"
        title={
          <>
            {monthLabel(monthKey, { month: "long" })} <strong>{monthKey.slice(0, 4)}.</strong>
          </>
        }
        description="Where your shared money went this month."
        actions={
          <div className="summary-controls">
            <div className="summary-month" role="group" aria-label="Choose month">
              <button type="button" onClick={() => setMonthKey((k) => shiftMonth(k, -1))} aria-label="Previous month">
                <ChevronLeft size={16} />
              </button>
              <span>
                <CalendarRange size={14} />
                {monthLabel(monthKey, { month: "short", year: "numeric" })}
              </span>
              <button
                type="button"
                onClick={() => setMonthKey((k) => shiftMonth(k, 1))}
                disabled={monthKey >= currentKey}
                aria-label="Next month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
            <select className="pf-select page-filter" value={groupId} onChange={(e) => setGroupId(e.target.value)} aria-label="Group">
              <option value="all">All groups</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      {/* KPI tiles */}
      <section className="admin-stats summary-stats">
        <div className="dashboard-balance-card dashboard-balance-main">
          <div className="dashboard-card-top">
            <span>Your spending</span>
            <div className="dashboard-card-icon">
              <Wallet size={17} />
            </div>
          </div>
          <div className="dashboard-small-value light">{loading ? "—" : formatCents(s.myShareCents)}</div>
          <p className="dashboard-card-description">
            {s.changePct === null ? (
              "Your share of expenses"
            ) : (
              <span className="summary-change">
                {s.changePct >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {s.changePct >= 0 ? "+" : ""}
                {s.changePct}% vs {monthLabel(shiftMonth(monthKey, -1), { month: "short" })}
              </span>
            )}
          </p>
        </div>

        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>Group spending</span>
            <div className="dashboard-card-icon">
              <ReceiptText size={17} />
            </div>
          </div>
          <div className="dashboard-small-value">{loading ? "—" : formatCents(s.totalCents)}</div>
          <p className="dashboard-card-description">
            {s.count} expense{s.count === 1 ? "" : "s"} in {groupId === "all" ? `${s.groups.length} group${s.groups.length === 1 ? "" : "s"}` : groupName(groupId)}
          </p>
        </div>

        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>You paid</span>
            <div className="dashboard-card-icon dashboard-card-icon-green">
              <ArrowUpRight size={17} />
            </div>
          </div>
          <div className="dashboard-small-value">{loading ? "—" : formatCents(s.paidCents)}</div>
          <p className="dashboard-card-description">
            Balance effect{" "}
            <b className={s.netCents > 0 ? "dashboard-positive" : s.netCents < 0 ? "dashboard-negative" : ""}>
              {formatCents(s.netCents, "EUR", { sign: true })}
            </b>
          </p>
        </div>

        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>Settled up</span>
            <div className="dashboard-card-icon">
              <HandCoins size={17} />
            </div>
          </div>
          <div className="dashboard-small-value">{loading ? "—" : s.paymentsCount}</div>
          <p className="dashboard-card-description summary-settled">
            <span>
              <ArrowUpRight size={12} /> paid {formatCents(s.settledOutCents)}
            </span>
            <span>
              <ArrowDownLeft size={12} /> got {formatCents(s.settledInCents)}
            </span>
          </p>
        </div>
      </section>

      {loading ? (
        <div className="dashboard-panel page-panel">
          <SkeletonRows count={5} />
        </div>
      ) : (
        <>
          <section className="dashboard-content-grid">
            {/* By category — horizontal bars, one hue */}
            <div className="dashboard-panel">
              <div className="dashboard-panel-header">
                <div>
                  <h2>By category</h2>
                  <p>{metric === "share" ? "Your share of each category" : "Everything the group spent"}</p>
                </div>
                <div className="pf-segment">
                  <button type="button" className={metric === "share" ? "active" : ""} onClick={() => setMetric("share")}>
                    Your share
                  </button>
                  <button type="button" className={metric === "total" ? "active" : ""} onClick={() => setMetric("total")}>
                    Group total
                  </button>
                </div>
              </div>

              {s.categories.length === 0 ? (
                <EmptyState icon={ReceiptText} title="No expenses this month" text="Pick another month, or add an expense." />
              ) : (
                <ul className="summary-cats">
                  {s.categories.map((c) => {
                    const cat = categoryFor(c.category);
                    const Icon = cat.icon;
                    const value = catValue(c);
                    const base = metric === "share" ? s.myShareCents : s.totalCents;
                    const pct = base ? Math.round((value / base) * 100) : 0;
                    return (
                      <li key={c.category} className="summary-cat">
                        <span className="dashboard-expense-icon">
                          <Icon size={16} />
                        </span>
                        <div className="summary-cat-body">
                          <div className="summary-cat-row">
                            <strong>{cat.label}</strong>
                            <span>
                              <b>{formatCents(value)}</b> · {pct}%
                            </span>
                          </div>
                          <div
                            className="summary-track"
                            data-tip={`${cat.label}: ${formatCents(value)} (${c.count} expense${c.count === 1 ? "" : "s"})`}
                          >
                            <span style={{ width: `${(value / catMax) * 100}%` }} />
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            <div className="group-side">
              {/* 6-month trend — vertical bars, one hue, selected month in ink */}
              <div className="dashboard-panel">
                <div className="dashboard-panel-header">
                  <div>
                    <h2>Your spending, 6 months</h2>
                    <p>Your share per month</p>
                  </div>
                </div>
                <div className="admin-chart summary-trend" role="img" aria-label="Your spending per month for the last 6 months">
                  {s.trend.map((t) => (
                    <button
                      type="button"
                      key={t.key}
                      className={`admin-chart-col ${t.key === monthKey ? "selected" : ""}`}
                      onClick={() => setMonthKey(t.key)}
                      data-tip={`${monthLabel(t.key, { month: "long" })}: ${formatCents(t.shareCents)} your share · ${formatCents(t.totalCents)} group`}
                      aria-label={`${monthLabel(t.key)}: ${formatCents(t.shareCents)}`}
                    >
                      <span className="admin-chart-value">{t.shareCents ? short(t.shareCents) : ""}</span>
                      <div className="admin-chart-track">
                        <div className="admin-chart-bar" style={{ height: `${t.shareCents ? Math.max((t.shareCents / trendMax) * 100, 3) : 0}%` }} />
                      </div>
                      <span className="admin-chart-label">{monthLabel(t.key, { month: "short" })}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* By group */}
              {groupId === "all" && s.groups.length > 0 && (
                <div className="dashboard-panel">
                  <div className="dashboard-panel-header">
                    <div>
                      <h2>By group</h2>
                      <p>Group total and your share</p>
                    </div>
                  </div>
                  <div className="dashboard-groups-list">
                    {s.groups.map((g) => (
                      <div key={g.groupId} className="dashboard-group-card static">
                        <div className={`dashboard-group-card-avatar tone-${toneFor(g.groupId)}`}>{g.name.charAt(0).toUpperCase()}</div>
                        <div className="dashboard-group-card-info">
                          <strong>{g.name}</strong>
                          <span>
                            {g.count} expense{g.count === 1 ? "" : "s"} · your share {formatCents(g.shareCents)}
                          </span>
                        </div>
                        <div className="dashboard-group-balance">{formatCents(g.totalCents)}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* This month's expenses */}
          <section className="dashboard-panel page-panel summary-list">
            <div className="dashboard-panel-header">
              <div>
                <h2>Expenses in {monthLabel(monthKey, { month: "long" })}</h2>
                <p>
                  {s.biggest
                    ? `Biggest: ${s.biggest.description} (${formatCents(Math.round(Number(s.biggest.amount) * 100))})`
                    : "Nothing recorded this month"}
                </p>
              </div>
            </div>
            {s.expenses.length === 0 ? (
              <EmptyState icon={CalendarRange} title="No expenses this month" />
            ) : (
              <div className="dashboard-expense-list">
                {s.expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    userId={userId}
                    groupName={groupName(expense.group_id)}
                    memberName={memberName}
                    menuItems={menuFor(expense)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}

export default Summary;
