import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { LayoutDashboard, Users, LogOut } from "lucide-react";
import { clearAuth, getUser } from "../lib/api.js";

export default function Layout() {
  const nav = useNavigate();
  const user = getUser();
  const logout = () => {
    clearAuth();
    nav("/login");
  };
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-colors ${
      isActive ? "bg-brand-orange/10 text-brand-orange border-l-2 border-brand-orange" : "text-brand-nardo hover:text-brand-ink hover:bg-brand-light"
    }`;

  return (
    <div className="min-h-screen flex bg-brand-light">
      {/* Sidebar */}
      <aside className="w-60 bg-white border-r border-brand-border flex flex-col">
        <Link to="/" className="flex items-center gap-2.5 px-6 h-16 border-b border-brand-border">
          <div className="w-9 h-9 rounded-lg bg-brand-ink flex items-center justify-center">
            <span className="text-brand-orange font-extrabold text-xs">CRM</span>
          </div>
          <div className="leading-tight">
            <p className="font-extrabold text-sm">
              Let's <span className="text-brand-orange">Go</span>
            </p>
            <p className="text-[10px] text-brand-nardo uppercase tracking-widest">
              Pipeline
            </p>
          </div>
        </Link>

        <nav className="flex-1 py-4 space-y-1">
          <NavLink to="/" end className={linkClass} data-testid="nav-dashboard">
            <LayoutDashboard className="w-4 h-4" /> Dashboard
          </NavLink>
          <NavLink to="/leads" className={linkClass} data-testid="nav-leads">
            <Users className="w-4 h-4" /> Leads
          </NavLink>
        </nav>

        <div className="border-t border-brand-border p-4">
          {user && (
            <div className="mb-3">
              <p className="text-xs text-brand-nardo uppercase tracking-widest">Connecté</p>
              <p className="text-sm font-semibold truncate">{user.email}</p>
            </div>
          )}
          <button
            data-testid="crm-logout"
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 text-xs font-semibold text-brand-nardo hover:text-brand-ink border border-brand-border hover:border-brand-nardo py-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-x-hidden">
        <Outlet />
      </main>
    </div>
  );
}
