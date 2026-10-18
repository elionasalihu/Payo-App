import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Outlet } from "react-router-dom";
import { CreditCard, LayoutDashboard, Users, UsersRound } from "lucide-react";

import DashboardSidebar from "../../sections/DashboardSidebar";
import { adminFetchAll } from "../../supabase/api";

import "../../styles/client/Dashboard.css";
import "../../styles/client/Pages.css";
import "../../styles/admin/Admin.css";

const navigation = [
  { label: "Overview", icon: LayoutDashboard, to: "/admin", end: true },
  { label: "Users", icon: UsersRound, to: "/admin/users" },
  { label: "Groups", icon: Users, to: "/admin/groups" },
  { label: "Expenses", icon: CreditCard, to: "/admin/expenses" },
];

const AdminContext = createContext(null);

export function useAdminData() {
  return useContext(AdminContext);
}

function AdminLayout() {
  const [data, setData] = useState({ profiles: [], groups: [], members: [], expenses: [], settlements: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      setData(await adminFetchAll());
      setError("");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const lookups = useMemo(() => {
    const profileById = Object.fromEntries(data.profiles.map((p) => [p.id, p]));
    const groupById = Object.fromEntries(data.groups.map((g) => [g.id, g]));
    return {
      profileById,
      groupById,
      nameOf: (id) => profileById[id]?.full_name || profileById[id]?.email || "Unknown user",
    };
  }, [data.profiles, data.groups]);

  const value = useMemo(() => ({ ...data, ...lookups, loading, error, refresh }), [data, lookups, loading, error, refresh]);

  return (
    <AdminContext.Provider value={value}>
      <div className="dashboard-page admin-page">
        <DashboardSidebar navigation={navigation} variant="admin" homeTo="/admin" />
        <main className="dashboard-main">
          <Outlet />
        </main>
      </div>
    </AdminContext.Provider>
  );
}

export default AdminLayout;
