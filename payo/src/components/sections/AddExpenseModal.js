import { useEffect, useMemo, useState } from "react";
import { Users } from "lucide-react";

import Modal from "./Modal";
import { useWorkspace } from "./Workspace";
import { useToast } from "./Toast";
import { createExpense } from "../supabase/api";
import { CATEGORIES, initials, todayISO } from "../../lib/format";
import { formatCents, fromCents, parseAmount, splitEqually, toCents } from "../../lib/money";

function AddExpenseModal() {
  const { expenseModal, closeAddExpense, groups, members, userId, refresh, openGroupModal } = useWorkspace();
  const toast = useToast();

  const [groupId, setGroupId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState("");
  const [date, setDate] = useState(todayISO());
  const [category, setCategory] = useState("general");
  const [mode, setMode] = useState("equal");
  const [selected, setSelected] = useState([]);
  const [exact, setExact] = useState({});
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const groupMembers = useMemo(
    () => members.filter((m) => m.group_id === groupId),
    [members, groupId]
  );
  const group = groups.find((g) => g.id === groupId);
  const currency = group?.currency || "EUR";

  // Reset when the modal opens
  useEffect(() => {
    if (!expenseModal.open) return;
    const initialGroup = expenseModal.groupId || groups[0]?.id || "";
    setGroupId(initialGroup);
    setDescription("");
    setAmount("");
    setDate(todayISO());
    setCategory("general");
    setMode("equal");
    setExact({});
    setError("");
  }, [expenseModal.open, expenseModal.groupId, groups]);

  // Reset participants when the group changes
  useEffect(() => {
    setSelected(groupMembers.map((m) => m.user_id));
    setPaidBy(groupMembers.some((m) => m.user_id === userId) ? userId : groupMembers[0]?.user_id || "");
    setExact({});
  }, [groupMembers, userId]);

  const totalCents = toCents(parseAmount(amount) || 0);

  const equalParts = useMemo(() => {
    const ordered = groupMembers.map((m) => m.user_id).filter((id) => selected.includes(id));
    return splitEqually(totalCents, ordered);
  }, [groupMembers, selected, totalCents]);

  const exactCents = useMemo(() => {
    const out = {};
    Object.entries(exact).forEach(([id, v]) => {
      const n = parseAmount(v);
      if (v !== "" && !Number.isNaN(n) && n > 0) out[id] = toCents(n);
    });
    return out;
  }, [exact]);

  const exactSum = Object.values(exactCents).reduce((s, n) => s + n, 0);
  const remaining = totalCents - exactSum;

  const nameOf = (m) => (m.user_id === userId ? "You" : m.profile?.full_name || m.profile?.email || "Member");

  const toggle = (id) =>
    setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const value = parseAmount(amount);
    if (!groupId) return setError("Choose a group.");
    if (!description.trim()) return setError("Add a short description, like “Dinner” or “Taxi”.");
    if (Number.isNaN(value) || value <= 0) return setError("Enter a valid amount, e.g. 24.50");
    if (!paidBy) return setError("Choose who paid.");

    let parts;
    if (mode === "equal") {
      if (!selected.length) return setError("Pick at least one person to split with.");
      parts = equalParts;
    } else {
      if (!Object.keys(exactCents).length) return setError("Enter at least one person’s share.");
      if (remaining !== 0) {
        return setError(
          remaining > 0
            ? `${formatCents(remaining, currency)} still needs to be assigned.`
            : `Shares are ${formatCents(-remaining, currency)} over the total.`
        );
      }
      parts = exactCents;
    }

    const splits = Object.entries(parts)
      .filter(([, cents]) => cents > 0)
      .map(([user_id, cents]) => ({ user_id, amount: fromCents(cents) }));

    setSaving(true);
    try {
      await createExpense({
        groupId,
        description: description.trim(),
        amount: fromCents(totalCents),
        paidBy,
        splits,
        category,
        date,
      });
      toast.success(`Added “${description.trim()}”`);
      closeAddExpense();
      refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (expenseModal.open && groups.length === 0) {
    return (
      <Modal open onClose={closeAddExpense} title="Add an expense">
        <div className="pf-empty">
          <span className="pf-empty-icon">
            <Users size={20} />
          </span>
          <p>Expenses live inside groups. Create your first group, or join one with an invite code.</p>
          <button
            type="button"
            className="pbtn pbtn-primary"
            onClick={() => {
              closeAddExpense();
              openGroupModal("create");
            }}
          >
            Create a group
          </button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      open={expenseModal.open}
      onClose={closeAddExpense}
      title="Add an expense"
      subtitle="Record who paid and how it’s shared."
      width={560}
      footer={
        <>
          <button type="button" className="pbtn pbtn-ghost" onClick={closeAddExpense}>
            Cancel
          </button>
          <button type="submit" form="add-expense-form" className="pbtn pbtn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save expense"}
          </button>
        </>
      }
    >
      <form id="add-expense-form" className="pf-form" onSubmit={handleSubmit} noValidate>
        {error && <div className="pf-error" role="alert">{error}</div>}

        <div className="pf-row">
          <label className="pf-field">
            <span className="pf-label">Group</span>
            <select className="pf-select" value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>

          <label className="pf-field">
            <span className="pf-label">Category</span>
            <select className="pf-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label className="pf-field">
          <span className="pf-label">Description</span>
          <input
            className="pf-input"
            placeholder="e.g. Dinner at Artigiano"
            value={description}
            maxLength={100}
            onChange={(e) => setDescription(e.target.value)}
            autoFocus
          />
        </label>

        <div className="pf-row">
          <label className="pf-field">
            <span className="pf-label">Amount</span>
            <div className="pf-input-money">
              <span>{currency === "EUR" ? "€" : currency}</span>
              <input
                className="pf-input"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          </label>

          <label className="pf-field">
            <span className="pf-label">Date</span>
            <input className="pf-input" type="date" value={date} max={todayISO()} onChange={(e) => setDate(e.target.value)} />
          </label>
        </div>

        <label className="pf-field">
          <span className="pf-label">Paid by</span>
          <select className="pf-select" value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {groupMembers.map((m) => (
              <option key={m.user_id} value={m.user_id}>
                {nameOf(m)}
              </option>
            ))}
          </select>
        </label>

        <div className="pf-field">
          <div className="pf-split-head">
            <span className="pf-label">Split</span>
            <div className="pf-segment" role="tablist">
              <button type="button" className={mode === "equal" ? "active" : ""} onClick={() => setMode("equal")}>
                Equally
              </button>
              <button type="button" className={mode === "exact" ? "active" : ""} onClick={() => setMode("exact")}>
                Exact amounts
              </button>
            </div>
          </div>

          <div className="pf-split-list">
            {groupMembers.map((m) =>
              mode === "equal" ? (
                <label className="pf-split-row" key={m.user_id}>
                  <input type="checkbox" checked={selected.includes(m.user_id)} onChange={() => toggle(m.user_id)} />
                  <span className="pf-avatar">{initials(m.profile?.full_name || m.profile?.email)}</span>
                  <span className="pf-split-name">{nameOf(m)}</span>
                  <span className="pf-split-amount">
                    {selected.includes(m.user_id) ? formatCents(equalParts[m.user_id] || 0, currency) : "—"}
                  </span>
                </label>
              ) : (
                <div className="pf-split-row" key={m.user_id}>
                  <span className="pf-avatar">{initials(m.profile?.full_name || m.profile?.email)}</span>
                  <span className="pf-split-name">{nameOf(m)}</span>
                  <input
                    className="pf-input"
                    inputMode="decimal"
                    placeholder="0.00"
                    aria-label={`${nameOf(m)}'s share`}
                    value={exact[m.user_id] ?? ""}
                    onChange={(e) => setExact((x) => ({ ...x, [m.user_id]: e.target.value }))}
                  />
                </div>
              )
            )}
          </div>

          {mode === "equal" ? (
            <div className="pf-split-summary">
              <span>
                {selected.length} of {groupMembers.length} people
              </span>
              <span>
                {selected.length && totalCents
                  ? `${formatCents(Math.floor(totalCents / selected.length), currency)} each`
                  : ""}
              </span>
            </div>
          ) : (
            <div className="pf-split-summary">
              <span>
                {formatCents(exactSum, currency)} of {formatCents(totalCents, currency)}
              </span>
              <span className={remaining === 0 && totalCents > 0 ? "ok" : "bad"}>
                {remaining === 0
                  ? totalCents > 0
                    ? "All assigned"
                    : ""
                  : remaining > 0
                  ? `${formatCents(remaining, currency)} left`
                  : `${formatCents(-remaining, currency)} over`}
              </span>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
}

export default AddExpenseModal;
