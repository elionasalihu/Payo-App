import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, MoreHorizontal } from "lucide-react";

import { categoryFor, friendlyDate } from "../../lib/format";
import { expenseImpact } from "../../lib/balances";
import { formatCents, formatMoney } from "../../lib/money";

export function PageHeader({ eyebrow, title, description, actions, back }) {
  return (
    <header className="dashboard-header">
      <div>
        {back}
        {eyebrow && <span className="dashboard-eyebrow">{eyebrow}</span>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </header>
  );
}

export function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="page-empty">
      {Icon && (
        <span className="page-empty-icon">
          <Icon size={20} strokeWidth={1.8} />
        </span>
      )}
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}

export function ErrorBanner({ message, onRetry }) {
  if (!message) return null;
  return (
    <div className="page-error" role="alert">
      <AlertTriangle size={16} />
      <span>{message}</span>
      {onRetry && (
        <button type="button" className="pbtn pbtn-ghost pbtn-sm" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

export function SkeletonRows({ count = 4 }) {
  return (
    <div className="page-skeleton">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="page-skeleton-row">
          <span />
          <div>
            <span />
            <span />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Small “…” menu. items: [{ label, onClick, to, danger, icon }] */
export function RowMenu({ items, label = "More actions" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const visible = items.filter(Boolean);
  if (!visible.length) return <span className="dashboard-expense-more-spacer" />;

  return (
    <div className="row-menu" ref={ref}>
      <button
        type="button"
        className="dashboard-expense-more"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <MoreHorizontal size={17} />
      </button>

      {open && (
        <div className="row-menu-pop" role="menu">
          {visible.map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                {Icon && <Icon size={14} />}
                {item.label}
              </>
            );
            return item.to ? (
              <Link key={item.label} to={item.to} role="menuitem" className="row-menu-item" onClick={() => setOpen(false)}>
                {content}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                className={`row-menu-item ${item.danger ? "danger" : ""}`}
                onClick={() => {
                  setOpen(false);
                  item.onClick?.();
                }}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** One expense line, showing how it affects the current user. */
export function ExpenseRow({ expense, userId, groupName, memberName, currency = "EUR", menuItems = [] }) {
  const cat = categoryFor(expense.category);
  const Icon = cat.icon;
  const impact = expenseImpact(expense, userId);
  const payer = memberName(expense.paid_by);

  let impactLabel = "Not involved";
  let impactClass = "neutral";
  if (impact > 0) {
    impactLabel = `you lent ${formatCents(impact, currency)}`;
    impactClass = "dashboard-positive";
  } else if (impact < 0) {
    impactLabel = `you owe ${formatCents(-impact, currency)}`;
    impactClass = "dashboard-negative";
  } else if (expense.paid_by === userId) {
    impactLabel = "your own expense";
  }

  return (
    <div className="dashboard-expense">
      <div className="dashboard-expense-icon">
        <Icon size={17} />
      </div>

      <div className="dashboard-expense-info">
        <strong>{expense.description}</strong>
        <span>
          {[groupName, friendlyDate(expense.expense_date), cat.label].filter(Boolean).join(" · ")}
        </span>
      </div>

      <div className="dashboard-expense-amount">
        <strong>{formatMoney(expense.amount, currency)}</strong>
        <span>
          <span className="expense-payer">{payer} paid · </span>
          <em className={impactClass}>{impactLabel}</em>
        </span>
      </div>

      <RowMenu items={menuItems} />
    </div>
  );
}
