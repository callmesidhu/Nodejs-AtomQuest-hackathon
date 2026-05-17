import { BarChart3, ClipboardCheck, FileDown, Gauge, ListChecks, LogOut, ShieldCheck, Users } from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { clsx } from "clsx";
import { useAuth } from "../store/auth";
import type { Role } from "../types/domain";

type NavItem = { to: string; label: string; icon: typeof Gauge; roles?: Role[] };

const items: NavItem[] = [
  { to: "/", label: "Dashboard", icon: Gauge },
  { to: "/goals", label: "Goals", icon: ListChecks },
  { to: "/approvals", label: "Approvals", icon: ClipboardCheck, roles: ["MANAGER"] },
  { to: "/checkins", label: "Check-ins", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileDown },
  { to: "/admin", label: "Admin", icon: Users, roles: ["ADMIN"] },
  { to: "/audit-logs", label: "Audit Logs", icon: ShieldCheck, roles: ["ADMIN"] }
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const visible = items.filter((item) => !item.roles || item.roles.includes(user!.role));

  return (
    <div className="min-h-screen bg-panel">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white p-5 lg:block">
        <div className="mb-8">
          <p className="text-2xl font-bold text-brand">GoalSync</p>
          <p className="mt-1 text-sm text-slate-500">Goal setting and tracking</p>
        </div>
        <nav className="space-y-1">
          {visible.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => clsx("flex items-center gap-3 rounded-md px-3 py-2 text-sm font-semibold", isActive ? "bg-mint text-brand" : "text-slate-600 hover:bg-slate-100")}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div>
            <p className="text-sm text-slate-500">{user?.role.replace("_", " ")}</p>
            <h1 className="text-xl font-bold text-ink">{user?.name}</h1>
          </div>
          <button onClick={logout} className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700">
            <LogOut size={16} /> Sign out
          </button>
        </header>
        <div className="mx-auto max-w-7xl p-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
