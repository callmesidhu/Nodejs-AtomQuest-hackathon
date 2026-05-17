import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./index.css";
import { AuthProvider } from "./store/auth";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AppLayout } from "./layouts/AppLayout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { Goals } from "./pages/Goals";
import { Approvals } from "./pages/Approvals";
import { Checkins } from "./pages/Checkins";
import { Reports } from "./pages/Reports";
import { Admin } from "./pages/Admin";
import { AuditLogs } from "./pages/AuditLogs";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    element: <ProtectedRoute />,
    children: [{
      element: <AppLayout />,
      children: [
        { index: true, element: <Dashboard /> },
        { path: "goals", element: <Goals /> },
        { path: "checkins", element: <Checkins /> },
        { path: "reports", element: <Reports /> },
        { element: <ProtectedRoute roles={["MANAGER"]} />, children: [{ path: "approvals", element: <Approvals /> }] },
        { element: <ProtectedRoute roles={["ADMIN"]} />, children: [{ path: "admin", element: <Admin /> }, { path: "audit-logs", element: <AuditLogs /> }] }
      ]
    }]
  }
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" />
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
