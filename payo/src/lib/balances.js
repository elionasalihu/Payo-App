import { toCents } from "./money";

/**
 * Net balance per user for one group, in cents.
 * Positive  → the group owes this person money.
 * Negative  → this person owes the group.
 */
export function computeNetBalances(memberIds, expenses, settlements) {
  const net = {};
  memberIds.forEach((id) => {
    net[id] = 0;
  });

  const add = (id, cents) => {
    net[id] = (net[id] || 0) + cents;
  };

  expenses.forEach((expense) => {
    add(expense.paid_by, toCents(expense.amount));
    (expense.splits || []).forEach((split) => add(split.user_id, -toCents(split.amount)));
  });

  settlements.forEach((s) => {
    // The payer has reduced their debt; the receiver has been paid back.
    add(s.from_user, toCents(s.amount));
    add(s.to_user, -toCents(s.amount));
  });

  return net;
}

/**
 * Turn net balances into the smallest practical list of payments
 * (greedy: biggest debtor pays biggest creditor, repeat).
 * Returns [{ from, to, cents }].
 */
export function simplifyDebts(net) {
  const debtors = [];
  const creditors = [];

  Object.entries(net).forEach(([id, cents]) => {
    if (cents < 0) debtors.push({ id, cents: -cents });
    else if (cents > 0) creditors.push({ id, cents });
  });

  debtors.sort((a, b) => b.cents - a.cents || a.id.localeCompare(b.id));
  creditors.sort((a, b) => b.cents - a.cents || a.id.localeCompare(b.id));

  const payments = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].cents, creditors[j].cents);
    if (pay > 0) payments.push({ from: debtors[i].id, to: creditors[j].id, cents: pay });
    debtors[i].cents -= pay;
    creditors[j].cents -= pay;
    if (debtors[i].cents === 0) i += 1;
    if (creditors[j].cents === 0) j += 1;
  }

  return payments;
}

/** How a single expense affects `userId`, in cents (positive = lent, negative = borrowed). */
export function expenseImpact(expense, userId) {
  const share = (expense.splits || []).find((s) => s.user_id === userId);
  const shareCents = share ? toCents(share.amount) : 0;
  if (expense.paid_by === userId) return toCents(expense.amount) - shareCents;
  return 0 - shareCents;
}

/**
 * Build everything the UI needs from the raw workspace data.
 */
export function buildSummary({ groups, members, expenses, settlements }, userId) {
  const byGroup = {};

  groups.forEach((group) => {
    const groupMembers = members.filter((m) => m.group_id === group.id);
    const groupExpenses = expenses.filter((e) => e.group_id === group.id);
    const groupSettlements = settlements.filter((s) => s.group_id === group.id);
    const memberIds = groupMembers.map((m) => m.user_id);

    const net = computeNetBalances(memberIds, groupExpenses, groupSettlements);
    const totalCents = groupExpenses.reduce((sum, e) => sum + toCents(e.amount), 0);

    byGroup[group.id] = {
      group,
      members: groupMembers,
      expenses: groupExpenses,
      settlements: groupSettlements,
      net,
      myNet: net[userId] || 0,
      totalCents,
      payments: simplifyDebts(net),
    };
  });

  const nets = Object.values(byGroup).map((g) => g.myNet);
  const oweCents = nets.filter((n) => n < 0).reduce((s, n) => s - n, 0);
  const owedCents = nets.filter((n) => n > 0).reduce((s, n) => s + n, 0);

  return {
    byGroup,
    oweCents,
    owedCents,
    totalCents: owedCents - oweCents,
    oweGroups: nets.filter((n) => n < 0).length,
    owedGroups: nets.filter((n) => n > 0).length,
  };
}
