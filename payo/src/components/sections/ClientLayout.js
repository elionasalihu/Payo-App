import { useEffect, useMemo } from "react";
import { Outlet, useSearchParams } from "react-router-dom";
import { Activity, ChartColumn, CreditCard, LayoutDashboard, Users } from "lucide-react";

import DashboardSidebar from "./DashboardSidebar";
import AddExpenseModal from "./AddExpenseModal";
import GroupModal from "./GroupModal";
import { WorkspaceProvider, useWorkspace } from "./Workspace";

import "../styles/client/Dashboard.css";
import "../styles/client/Pages.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, to: "/client", end: true },
  { label: "Expenses", icon: CreditCard, to: "/client/expenses" },
  { label: "Groups", icon: Users, to: "/client/groups" },
  { label: "Summary", icon: ChartColumn, to: "/client/summary" },
  { label: "Activity", icon: Activity, to: "/client/activity" },
];

function Shell() {
  const { groups, members, openAddExpense, loading } = useWorkspace();
  const [params, setParams] = useSearchParams();

  // PWA shortcut: /client?add=expense opens the Add expense modal
  useEffect(() => {
    if (loading || params.get("add") !== "expense") return;
    openAddExpense();
    params.delete("add");
    setParams(params, { replace: true });
  }, [loading, params, setParams, openAddExpense]);

  const sidebarGroups = useMemo(
    () =>
      groups.map((g) => ({
        id: g.id,
        name: g.name,
        memberCount: members.filter((m) => m.group_id === g.id).length,
      })),
    [groups, members]
  );

  return (
    <div className="dashboard-page">
      <DashboardSidebar navigation={navigation} groups={sidebarGroups} onAdd={() => openAddExpense()} />

      <main className="dashboard-main">
        <Outlet />
      </main>

      <AddExpenseModal />
      <GroupModal />
    </div>
  );
}

function ClientLayout() {
  return (
    <WorkspaceProvider>
      <Shell />
    </WorkspaceProvider>
  );
}

export default ClientLayout;
