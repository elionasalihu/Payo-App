import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useAuth } from "../../auth/AuthProvider";
import { fetchWorkspace } from "../supabase/api";
import { buildSummary } from "../../lib/balances";

const WorkspaceContext = createContext(null);

const EMPTY = { groups: [], members: [], expenses: [], settlements: [] };

/**
 * Loads all of the signed-in user's groups, members, expenses and settlements
 * once, and shares them (plus computed balances) with every client page.
 */
export function WorkspaceProvider({ children }) {
  const { user } = useAuth();
  const [data, setData] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal state shared by sidebar, mobile nav and pages
  const [expenseModal, setExpenseModal] = useState({ open: false, groupId: null });
  const [groupModal, setGroupModal] = useState({ open: false, tab: "create" });

  const userId = user?.id;

  const refresh = useCallback(async () => {
    if (!userId) return;
    try {
      const next = await fetchWorkspace(userId);
      setData(next);
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refresh();
  }, [refresh]);

  const summary = useMemo(() => buildSummary(data, userId), [data, userId]);

  const memberName = useCallback(
    (id) => {
      if (id === userId) return "You";
      const m = data.members.find((x) => x.user_id === id);
      return m?.profile?.full_name || m?.profile?.email || "Former member";
    },
    [data.members, userId]
  );

  const value = useMemo(
    () => ({
      ...data,
      summary,
      loading,
      error,
      refresh,
      userId,
      memberName,
      openAddExpense: (groupId = null) => setExpenseModal({ open: true, groupId }),
      closeAddExpense: () => setExpenseModal((s) => ({ ...s, open: false })),
      expenseModal,
      openGroupModal: (tab = "create") => setGroupModal({ open: true, tab }),
      closeGroupModal: () => setGroupModal((s) => ({ ...s, open: false })),
      groupModal,
    }),
    [data, summary, loading, error, refresh, userId, memberName, expenseModal, groupModal]
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used inside <WorkspaceProvider>");
  return ctx;
}
