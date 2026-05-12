import { Link, NavLink, useNavigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ChefHat, LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut } from "lucide-react";

const navItems = [
  { path: "/owner", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { path: "/owner/menu", label: "Mon menu", icon: UtensilsCrossed },
  { path: "/owner/orders", label: "Commandes", icon: ShoppingBag },
];

export default function OwnerLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-background">
      <aside data-testid="owner-sidebar" className="w-64 bg-white border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl brand-bg flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg brand-text-sm">Let's Go</h1>
              <p className="text-xs text-muted-foreground">Mon Restaurant</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} end={item.end}
              className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${isActive ? "bg-[#10B981] text-white shadow-md" : "text-foreground/70 hover:bg-muted hover:text-foreground"}`}>
              <item.icon className="w-4 h-4" />{item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3 px-3">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#10B981]">{user?.name?.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button data-testid="owner-logout-btn" onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
            <LogOut className="w-4 h-4" />Deconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}
