import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Copy,
  Crown,
  DoorOpen,
  HandCoins,
  Pencil,
  Plus,
  ReceiptText,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
} from "lucide-react";

import Modal from "../../sections/Modal";
import { useWorkspace } from "../../sections/Workspace";
import { useToast } from "../../sections/Toast";
import { useConfirm } from "../../sections/Confirm";
import { EmptyState, ErrorBanner, ExpenseRow, PageHeader, RowMenu, SkeletonRows } from "../../sections/DashboardParts";
import { useExpenseActions } from "./Dashboard";
import {
  addMemberByEmail,
  createSettlement,
  deleteGroup,
  deleteSettlement,
  leaveGroup,
  removeMember,
  updateGroup,
} from "../../supabase/api";
import { friendlyDate, initials, toneFor } from "../../../lib/format";
import { formatCents, fromCents, parseAmount, toCents } from "../../../lib/money";

function SettleModal({ open, onClose, group, members, preset, userId, memberName, onSaved }) {
  const toast = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setFrom(preset?.from || userId);
    setTo(preset?.to || members.find((m) => m.user_id !== userId)?.user_id || "");
    setAmount(preset?.cents ? fromCents(preset.cents).toFixed(2) : "");
    setError("");
  }, [open, preset, members, userId]);

  const submit = async (e) => {
    e.preventDefault();
    const value = parseAmount(amount);
    if (!from || !to) return setError("Choose who paid and who received.");
    if (from === to) return setError("Payer and receiver must be different people.");
    if (Number.isNaN(value) || value <= 0) return setError("Enter a valid amount.");
    setSaving(true);
    try {
      await createSettlement({ groupId: group.id, fromUser: from, toUser: to, amount: value, createdBy: userId });
      toast.success(`Recorded ${formatCents(toCents(value), group.currency)} payment`);
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record a payment"
      subtitle="Log money paid back outside Payo (cash, bank transfer…)."
      width={460}
      footer={
        <>
          <button type="button" className="pbtn pbtn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="settle-form" className="pbtn pbtn-green" disabled={saving}>
            {saving ? "Saving…" : "Record payment"}
          </button>
        </>
      }
    >
      <form id="settle-form" className="pf-form" onSubmit={submit} noValidate>
        {error && <div className="pf-error" role="alert">{error}</div>}
        <div className="pf-row">
          <label className="pf-field">
            <span className="pf-label">From</span>
            <select className="pf-select" value={from} onChange={(e) => setFrom(e.target.value)}>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {memberName(m.user_id)}
                </option>
              ))}
            </select>
          </label>
          <label className="pf-field">
            <span className="pf-label">To</span>
            <select className="pf-select" value={to} onChange={(e) => setTo(e.target.value)}>
              {members.map((m) => (
                <option key={m.user_id} value={m.user_id}>
                  {memberName(m.user_id)}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="pf-field">
          <span className="pf-label">Amount</span>
          <div className="pf-input-money">
            <span>€</span>
            <input className="pf-input" inputMode="decimal" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} autoFocus />
          </div>
        </label>
      </form>
    </Modal>
  );
}

function EditGroupModal({ open, onClose, group, onSaved }) {
  const toast = useToast();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setName(group.name);
    setDescription(group.description || "");
    setError("");
  }, [open, group]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Group name can’t be empty.");
    setSaving(true);
    try {
      await updateGroup(group.id, { name: name.trim(), description: description.trim() });
      toast.success("Group updated");
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit group"
      width={480}
      footer={
        <>
          <button type="button" className="pbtn pbtn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" form="edit-group-form" className="pbtn pbtn-primary" disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </>
      }
    >
      <form id="edit-group-form" className="pf-form" onSubmit={submit} noValidate>
        {error && <div className="pf-error" role="alert">{error}</div>}
        <label className="pf-field">
          <span className="pf-label">Group name</span>
          <input className="pf-input" maxLength={60} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </label>
        <label className="pf-field">
          <span className="pf-label">
            Description <span className="pf-hint">(optional)</span>
          </span>
          <input className="pf-input" maxLength={140} value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>
      </form>
    </Modal>
  );
}

function GroupDetail() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const confirm = useConfirm();
  const { summary, loading, error, refresh, userId, memberName, openAddExpense } = useWorkspace();
  const { menuFor } = useExpenseActions();

  const info = summary.byGroup[groupId];
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [settle, setSettle] = useState({ open: false, preset: null });
  const [tab, setTab] = useState("expenses");
  const [editOpen, setEditOpen] = useState(false);

  const isOwner = info?.members.some((m) => m.user_id === userId && m.role === "owner");

  const memberRows = useMemo(() => {
    if (!info) return [];
    return [...info.members].sort((a, b) => (info.net[b.user_id] || 0) - (info.net[a.user_id] || 0));
  }, [info]);

  if (loading) {
    return (
      <div className="dashboard-panel page-panel">
        <SkeletonRows count={5} />
      </div>
    );
  }

  if (!info) {
    return (
      <div className="dashboard-panel page-panel">
        <EmptyState
          icon={Users}
          title="Group not found"
          text="It may have been deleted, or you’re no longer a member."
          action={
            <Link to="/client/groups" className="pbtn pbtn-primary pbtn-sm">
              Back to groups
            </Link>
          }
        />
      </div>
    );
  }

  const { group, members, expenses, settlements, net, payments, totalCents, myNet } = info;
  const cur = group.currency;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(group.invite_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn’t copy. Select the code and copy it manually.");
    }
  };

  const invite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true);
    try {
      const added = await addMemberByEmail(group.id, inviteEmail.trim());
      toast.success(`${added.full_name || added.email} added to the group`);
      setInviteEmail("");
      refresh();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setInviting(false);
    }
  };

  const kick = async (member) => {
    const bal = net[member.user_id] || 0;
    const ok = await confirm({
      title: `Remove ${member.profile?.full_name}?`,
      message:
        bal !== 0
          ? `They still have an open balance of ${formatCents(bal, cur, { sign: true })}. Their past expenses stay in the group.`
          : "Their past expenses stay in the group history.",
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    try {
      await removeMember(group.id, member.user_id);
      toast.success("Member removed");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const leave = async () => {
    const ok = await confirm({
      title: "Leave this group?",
      message:
        myNet !== 0
          ? `You still have an open balance of ${formatCents(myNet, cur, { sign: true })}. Consider settling up first.`
          : members.length === 1
          ? "You’re the last member, so the group and its history will be deleted."
          : isOwner
          ? "Ownership will pass to the next longest-standing member."
          : "You can rejoin later with the invite code.",
      confirmLabel: "Leave group",
      danger: true,
    });
    if (!ok) return;
    try {
      await leaveGroup(group.id);
      toast.success(`You left “${group.name}”`);
      await refresh();
      navigate("/client/groups");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const destroy = async () => {
    const ok = await confirm({
      title: "Delete group?",
      message: `“${group.name}” and all ${expenses.length} expenses and ${settlements.length} payments will be deleted for everyone. This can’t be undone.`,
      confirmLabel: "Delete group",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteGroup(group.id);
      toast.success("Group deleted");
      await refresh();
      navigate("/client/groups");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const undoSettlement = async (s) => {
    const ok = await confirm({
      title: "Delete payment?",
      message: `${memberName(s.from_user)} → ${memberName(s.to_user)}, ${formatCents(toCents(s.amount), cur)}. Balances will be recalculated.`,
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await deleteSettlement(s.id);
      toast.success("Payment deleted");
      refresh();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <>
      <PageHeader
        back={
          <Link to="/client/groups" className="page-back">
            <ArrowLeft size={14} /> Groups
          </Link>
        }
        eyebrow="GROUP"
        title={<strong>{group.name}</strong>}
        description={group.description || `${members.length} member${members.length === 1 ? "" : "s"} · created ${friendlyDate(group.created_at)}`}
        actions={
          <>
            {isOwner && (
              <button className="pbtn pbtn-ghost" onClick={() => setEditOpen(true)} aria-label="Edit group">
                <Pencil size={15} />
                <span className="hide-sm">Edit</span>
              </button>
            )}
            <button
              className="pbtn pbtn-ghost"
              onClick={() => setSettle({ open: true, preset: null })}
              disabled={members.length < 2}
            >
              <HandCoins size={15} />
              <span className="hide-sm">Record payment</span>
            </button>
            <button className="dashboard-header-add" onClick={() => openAddExpense(group.id)}>
              <Plus size={16} />
              Add expense
            </button>
          </>
        }
      />

      <ErrorBanner message={error} onRetry={refresh} />

      <section className="dashboard-balance-grid">
        <div className="dashboard-balance-card dashboard-balance-main">
          <div className="dashboard-card-top">
            <span>Your balance</span>
            <div className="dashboard-card-icon">
              <HandCoins size={17} />
            </div>
          </div>
          <div className="dashboard-balance-value">{myNet === 0 ? "Settled" : formatCents(myNet, cur, { sign: true })}</div>
          <div className="dashboard-balance-footer">
            <span>{myNet > 0 ? "The group owes you" : myNet < 0 ? "You owe the group" : "You’re all square"}</span>
          </div>
        </div>
        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>Total spent</span>
            <div className="dashboard-card-icon">
              <ReceiptText size={17} />
            </div>
          </div>
          <div className="dashboard-small-value">{formatCents(totalCents, cur)}</div>
          <p className="dashboard-card-description">
            {expenses.length} expense{expenses.length === 1 ? "" : "s"}
          </p>
        </div>
        <div className="dashboard-balance-card">
          <div className="dashboard-card-top">
            <span>Members</span>
            <div className="dashboard-card-icon dashboard-card-icon-green">
              <Users size={17} />
            </div>
          </div>
          <div className="dashboard-small-value">{members.length}</div>
          <div className="avatar-stack small">
            {members.slice(0, 5).map((m) => (
              <span key={m.user_id}>{initials(m.profile?.full_name || m.profile?.email)}</span>
            ))}
            {members.length > 5 && <span>+{members.length - 5}</span>}
          </div>
        </div>
      </section>

      <section className="dashboard-content-grid">
        {/* LEFT: expenses + payments */}
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>History</h2>
              <p>Expenses and payments in this group</p>
            </div>
            <div className="pf-segment">
              <button type="button" className={tab === "expenses" ? "active" : ""} onClick={() => setTab("expenses")}>
                Expenses ({expenses.length})
              </button>
              <button type="button" className={tab === "payments" ? "active" : ""} onClick={() => setTab("payments")}>
                Payments ({settlements.length})
              </button>
            </div>
          </div>

          {tab === "expenses" ? (
            expenses.length === 0 ? (
              <EmptyState
                icon={ReceiptText}
                title="No expenses yet"
                text={members.length < 2 ? "Invite someone first, then start adding shared costs." : "Add the first shared cost for this group."}
                action={
                  <button type="button" className="pbtn pbtn-primary pbtn-sm" onClick={() => openAddExpense(group.id)}>
                    <Plus size={14} /> Add expense
                  </button>
                }
              />
            ) : (
              <div className="dashboard-expense-list">
                {expenses.map((expense) => (
                  <ExpenseRow
                    key={expense.id}
                    expense={expense}
                    userId={userId}
                    memberName={memberName}
                    currency={cur}
                    menuItems={menuFor(expense, { showGroupLink: false })}
                  />
                ))}
              </div>
            )
          ) : settlements.length === 0 ? (
            <EmptyState icon={HandCoins} title="No payments yet" text="When someone pays back what they owe, record it here." />
          ) : (
            <div className="dashboard-expense-list">
              {settlements.map((s) => (
                <div key={s.id} className="dashboard-expense">
                  <div className="dashboard-expense-icon tone-green">
                    <HandCoins size={17} />
                  </div>
                  <div className="dashboard-expense-info">
                    <strong>
                      {memberName(s.from_user)} paid {memberName(s.to_user)}
                    </strong>
                    <span>{friendlyDate(s.created_at)}{s.note ? ` · ${s.note}` : ""}</span>
                  </div>
                  <div className="dashboard-expense-amount">
                    <strong className="dashboard-positive">{formatCents(toCents(s.amount), cur)}</strong>
                    <span>payment</span>
                  </div>
                  <RowMenu
                    items={[
                      (s.created_by === userId || isOwner) && {
                        label: "Delete",
                        icon: Trash2,
                        danger: true,
                        onClick: () => undoSettlement(s),
                      },
                    ]}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: settle up, members, invite */}
        <div className="group-side">
          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Settle up</h2>
                <p>Fewest payments to clear all debts</p>
              </div>
            </div>
            {payments.length === 0 ? (
              <div className="settle-clear">
                <span>
                  <Check size={16} />
                </span>
                Everyone is settled up.
              </div>
            ) : (
              <div className="settle-list">
                {payments.map((p) => (
                  <div key={`${p.from}-${p.to}`} className={`settle-row ${p.from === userId || p.to === userId ? "mine" : ""}`}>
                    <div className="settle-people">
                      <strong>{memberName(p.from)}</strong>
                      <ArrowRight size={13} />
                      <strong>{memberName(p.to)}</strong>
                    </div>
                    <span className="settle-amount">{formatCents(p.cents, cur)}</span>
                    <button type="button" className="pbtn pbtn-ghost pbtn-sm" onClick={() => setSettle({ open: true, preset: p })}>
                      Settle
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="dashboard-panel-header">
              <div>
                <h2>Members</h2>
                <p>Balances within this group</p>
              </div>
            </div>

            <div className="dashboard-groups-list">
              {memberRows.map((m) => {
                const bal = net[m.user_id] || 0;
                return (
                  <div key={m.user_id} className="dashboard-group-card static">
                    <div className={`dashboard-group-card-avatar tone-${toneFor(m.user_id)}`}>
                      {initials(m.profile?.full_name || m.profile?.email)}
                    </div>
                    <div className="dashboard-group-card-info">
                      <strong>
                        {m.user_id === userId ? `${m.profile?.full_name || "You"} (you)` : m.profile?.full_name}
                        {m.role === "owner" && <Crown size={11} className="owner-crown" aria-label="Owner" />}
                      </strong>
                      <span>{m.profile?.email}</span>
                    </div>
                    <div className={`dashboard-group-balance ${bal > 0 ? "positive" : bal < 0 ? "negative" : "settled"}`}>
                      {bal === 0 ? "Settled" : formatCents(bal, cur, { sign: true })}
                    </div>
                    {isOwner && m.user_id !== userId ? (
                      <button type="button" className="icon-btn" onClick={() => kick(m)} aria-label={`Remove ${m.profile?.full_name}`}>
                        <UserMinus size={15} />
                      </button>
                    ) : (
                      <span className="icon-btn-spacer" />
                    )}
                  </div>
                );
              })}
            </div>

            <form className="invite-form" onSubmit={invite}>
              <input
                className="pf-input"
                type="email"
                placeholder="Add by email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                aria-label="Member email"
              />
              <button type="submit" className="pbtn pbtn-primary" disabled={inviting || !inviteEmail.trim()}>
                <UserPlus size={15} />
                {inviting ? "Adding…" : "Add"}
              </button>
            </form>

            <div className="invite-code">
              <div>
                <span>Invite code</span>
                <code>{group.invite_code}</code>
              </div>
              <button type="button" className="pbtn pbtn-ghost pbtn-sm" onClick={copyCode}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </div>

          <div className="group-danger">
            <button type="button" className="pbtn pbtn-ghost pbtn-sm" onClick={leave}>
              <DoorOpen size={14} /> Leave group
            </button>
            {isOwner && (
              <button type="button" className="pbtn pbtn-danger pbtn-sm" onClick={destroy}>
                <Trash2 size={14} /> Delete group
              </button>
            )}
          </div>
        </div>
      </section>

      <EditGroupModal open={editOpen} onClose={() => setEditOpen(false)} group={group} onSaved={refresh} />

      <SettleModal
        open={settle.open}
        preset={settle.preset}
        onClose={() => setSettle({ open: false, preset: null })}
        group={group}
        members={members}
        userId={userId}
        memberName={memberName}
        onSaved={refresh}
      />
    </>
  );
}

export default GroupDetail;
