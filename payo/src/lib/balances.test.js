import { computeNetBalances, simplifyDebts, expenseImpact, buildSummary } from "./balances";
import { splitEqually, parseAmount, formatMoney } from "./money";

const A = "a";
const B = "b";
const C = "c";

const sum = (obj) => Object.values(obj).reduce((s, n) => s + n, 0);

test("equal split always adds up to the total", () => {
  const parts = splitEqually(10000, [A, B, C]);
  expect(parts).toEqual({ a: 3334, b: 3333, c: 3333 });
  expect(sum(parts)).toBe(10000);
  expect(sum(splitEqually(1, [A, B, C]))).toBe(1);
});

test("net balances: payer is owed, participants owe", () => {
  const expenses = [
    { paid_by: A, amount: 90, splits: [{ user_id: A, amount: 30 }, { user_id: B, amount: 30 }, { user_id: C, amount: 30 }] },
  ];
  const net = computeNetBalances([A, B, C], expenses, []);
  expect(net).toEqual({ a: 6000, b: -3000, c: -3000 });
  expect(sum(net)).toBe(0);
});

test("settlements reduce debt", () => {
  const expenses = [{ paid_by: A, amount: 60, splits: [{ user_id: A, amount: 30 }, { user_id: B, amount: 30 }] }];
  const net = computeNetBalances([A, B], expenses, [{ from_user: B, to_user: A, amount: 30 }]);
  expect(net).toEqual({ a: 0, b: 0 });
});

test("simplifyDebts produces minimal greedy payments that clear everything", () => {
  const net = { a: 5000, b: -2000, c: -3000 };
  const payments = simplifyDebts(net);
  expect(payments).toEqual([
    { from: "c", to: "a", cents: 3000 },
    { from: "b", to: "a", cents: 2000 },
  ]);

  const after = { ...net };
  payments.forEach((p) => {
    after[p.from] += p.cents;
    after[p.to] -= p.cents;
  });
  expect(Object.values(after).every((v) => v === 0)).toBe(true);
});

test("expenseImpact: lent vs borrowed", () => {
  const e = { paid_by: A, amount: 90, splits: [{ user_id: A, amount: 30 }, { user_id: B, amount: 60 }] };
  expect(expenseImpact(e, A)).toBe(6000);
  expect(expenseImpact(e, B)).toBe(-6000);
  expect(expenseImpact(e, C)).toBe(0);
});

test("buildSummary totals across groups", () => {
  const data = {
    groups: [{ id: "g1" }, { id: "g2" }],
    members: [
      { group_id: "g1", user_id: A },
      { group_id: "g1", user_id: B },
      { group_id: "g2", user_id: A },
      { group_id: "g2", user_id: B },
    ],
    expenses: [
      { group_id: "g1", paid_by: A, amount: 20, splits: [{ user_id: A, amount: 10 }, { user_id: B, amount: 10 }] },
      { group_id: "g2", paid_by: B, amount: 50, splits: [{ user_id: A, amount: 25 }, { user_id: B, amount: 25 }] },
    ],
    settlements: [],
  };
  const s = buildSummary(data, A);
  expect(s.owedCents).toBe(1000);
  expect(s.oweCents).toBe(2500);
  expect(s.totalCents).toBe(-1500);
  expect(s.byGroup.g1.totalCents).toBe(2000);
});

test("parseAmount accepts comma decimals and rejects junk", () => {
  expect(parseAmount("12,50")).toBe(12.5);
  expect(parseAmount("7")).toBe(7);
  expect(Number.isNaN(parseAmount("1.234"))).toBe(true);
  expect(Number.isNaN(parseAmount("abc"))).toBe(true);
});

test("formatMoney with sign", () => {
  expect(formatMoney(24.5, "EUR", { sign: true })).toBe("+€24.50");
  expect(formatMoney(-18.2, "EUR", { sign: true })).toBe("-€18.20");
  expect(formatMoney(0, "EUR", { sign: true })).toBe("€0.00");
});
