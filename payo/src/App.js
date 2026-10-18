import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./auth/AuthProvider";
import { GuestOnly, RequireAdmin, RequireAuth } from "./auth/RouteGuards";
import { ToastProvider } from "./components/sections/Toast";
import { ConfirmProvider } from "./components/sections/Confirm";
import { PwaProvider } from "./pwa/PwaProvider";
import { PwaBanners } from "./pwa/PwaUI";

import Home from "./components/pages/main/Home";
import NotFound from "./components/pages/main/NotFound";
import Legal from "./components/pages/main/Legal";

import Login from "./components/pages/auth/Login";
import Register from "./components/pages/auth/Register";
import ForgotPassword from "./components/pages/auth/ForgotPassword";
import ResetPassword from "./components/pages/auth/ResetPassword";

import ClientLayout from "./components/sections/ClientLayout";
import ClientDashboard from "./components/pages/client/Dashboard";
import Expenses from "./components/pages/client/Expenses";
import Groups from "./components/pages/client/Groups";
import GroupDetail from "./components/pages/client/GroupDetail";
import Activity from "./components/pages/client/Activity";
import Summary from "./components/pages/client/Summary";
import Settings from "./components/pages/client/Settings";

import AdminLayout from "./components/pages/admin/AdminLayout";
import { AdminExpenses, AdminGroups, AdminOverview, AdminUsers } from "./components/pages/admin/AdminPages";

function App() {
  return (
    <BrowserRouter>
      <PwaProvider>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              {/* Public */}
              <Route path="/" element={<Home />} />
              <Route path="/privacy" element={<Legal page="privacy" />} />
              <Route path="/terms" element={<Legal page="terms" />} />

              {/* Auth */}
              <Route path="/login" element={<GuestOnly><Login /></GuestOnly>} />
              <Route path="/register" element={<GuestOnly><Register /></GuestOnly>} />
              <Route path="/signup" element={<Navigate to="/register" replace />} />
              <Route path="/forgot-password" element={<GuestOnly><ForgotPassword /></GuestOnly>} />
              <Route path="/reset-password" element={<ResetPassword />} />

              {/* Client */}
              <Route
                path="/client"
                element={
                  <RequireAuth>
                    <ClientLayout />
                  </RequireAuth>
                }
              >
                <Route index element={<ClientDashboard />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="groups" element={<Groups />} />
                <Route path="groups/:groupId" element={<GroupDetail />} />
                <Route path="summary" element={<Summary />} />
                <Route path="activity" element={<Activity />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Admin */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminOverview />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="groups" element={<AdminGroups />} />
                <Route path="expenses" element={<AdminExpenses />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
      <PwaBanners />
      </PwaProvider>
    </BrowserRouter>
  );
}

export default App;
