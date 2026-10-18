import { toCents } from "./money";

/** "2026-10" for a Date or ISO string */
export function monthKeyOf(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}/.test(value)) return value.slice(0, 7);
  const d = value instanceof Date ? value : new Date(value);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Shift a "YYYY-MM" key by n months */
export function shiftMonth(key, n) {
  const [y, m] = key.split("-").map(Number);
  const d = new Date(y, m - 1 + n, 1);
  return monthKeyOf(d);
}

export function monthLabel(key, opts = { month: "long", year: "numeric" }) {
  return new Date(`${key}-01T00:00:00`).toLocaleDateString("en-US", opts);
}

/** Settlements carry a timestamp; use the local date's month */
const settlementMonth = (s) => monthKeyOf(new Date(s.created_at));

const shareOf = (expense, userId) => {
  const s = (expense.splits || []).find((x) => x.user_id === userId);
  return s ? toCents(s.amount) : 0;
};

/**
 * Everything the monthly summary page needs for one month.
 * All money values are integer cents.
 *
 * data: { groups, expenses, settlements } (the user's workspace)
 * groupId: optional — restrict to one group ("all" or undefined = every group)
 */
export function monthlySummary({ groups, expenses, settlements }, userId, monthKey, groupId = "all") {
  const inScope = (gid) => groupId === "all" || gid === groupId;

  const monthExpenses = expenses.filter((e) => inScope(e.group_id) && monthKeyOf(e.expense_date) === monthKey);
  const monthSettlements = settlements.filter((s) => inScope(s.group_id) && settlementMonth(s) === monthKey);

  let totalCents = 0;
  let myShareCents = 0;
  let paidCents = 0;

  const categories = {};
  const byGroup = {};

  monthExpenses.forEach((e) => {
    const amount = toCents(e.amount);
    const share = shareOf(e, userId);

    totalCents += amount;
    myShareCents += share;
    if (e.paid_by === userId) paidCents += amount;

    const c = (categories[e.category || "general"] ||= { category: e.category || "general", totalCents: 0, shareCents: 0, count: 0 });
    c.totalCents += amount;
    c.shareCents += share;
    c.count += 1;

    const g = (byGroup[e.group_id] ||= { groupId: e.group_id, totalCents: 0, shareCents: 0, count: 0 });
    g.totalCents += amount;
    g.shareCents += share;
    g.count += 1;
  });

  const settledOutCents = monthSettlements.filter((s) => s.from_user === userId).reduce((t, s) => t + toCents(s.amount), 0);
  const settledInCents = monthSettlements.filter((s) => s.to_user === userId).reduce((t, s) => t + toCents(s.amount), 0);

  const biggest = [...monthExpenses].sort((a, b) => toCents(b.amount) - toCents(a.amount))[0] || null;

  // Previous month, for comparison of "your spending"
  const prevKey = shiftMonth(monthKey, -1);
  const prevShareCents = expenses
    .filter((e) => inScope(e.group_id) && monthKeyOf(e.expense_date) === prevKey)
    .reduce((t, e) => t + shareOf(e, userId), 0);

  const changePct = prevShareCents > 0 ? Math.round(((myShareCents - prevShareCents) / prevShareCents) * 100) : null;

  // Last 6 months ending at monthKey
  const trend = [];
  for (let i = 5; i >= 0; i -= 1) {
    const k = shiftMonth(monthKey, -i);
    const list = expenses.filter((e) => inScope(e.group_id) && monthKeyOf(e.expense_date) === k);
    trend.push({
      key: k,
      shareCents: list.reduce((t, e) => t + shareOf(e, userId), 0),
      totalCents: list.reduce((t, e) => t + toCents(e.amount), 0),
    });
  }

  const groupName = (id) => groups.find((g) => g.id === id)?.name || "Group";

  return {
    monthKey,
    count: monthExpenses.length,
    totalCents,
    myShareCents,
    paidCents,
    // What this month's expenses did to your balance (paid for others minus what others paid for you)
    netCents: paidCents - myShareCents,
    settledOutCents,
    settledInCents,
    paymentsCount: monthSettlements.length,
    prevShareCents,
    changePct,
    biggest,
    categories: Object.values(categories).sort((a, b) => b.shareCents - a.shareCents || b.totalCents - a.totalCents),
    groups: Object.values(byGroup)
      .map((g) => ({ ...g, name: groupName(g.groupId) }))
      .sort((a, b) => b.totalCents - a.totalCents),
    expenses: monthExpenses,
    trend,
  };
}
