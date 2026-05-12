import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LayoutDashboard, Store, ShoppingBag, Bike, Users, LogOut, ChefHat, Tag, Bell, MapPin } from "lucide-react";

const navItems = [
  { path: "/admin", label: "Tableau de bord", icon: LayoutDashboard, end: true },
  { path: "/admin/restaurants", label: "Restaurants", icon: Store },
  { path: "/admin/orders", label: "Commandes", icon: ShoppingBag },
  { path: "/admin/drivers", label: "Livreurs", icon: Bike },
  { path: "/admin/clients", label: "Clients", icon: Users },
  { path: "/admin/promos", label: "Codes Promo", icon: Tag },
  { path: "/admin/delivery", label: "Livraison & Marge", icon: MapPin },
  { path: "/admin/notifications", label: "Notifications", icon: Bell },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <aside data-testid="admin-sidebar" className="w-64 bg-white border-r border-border flex flex-col shrink-0">
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl brand-bg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg brand-text-sm">Let's Go</h1>
            <p className="text-xs text-muted-foreground">Administration</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            data-testid={`nav-${item.label.toLowerCase().replace(/\s/g, "-")}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-[#FF6B00] text-white shadow-md"
                  : "text-foreground/70 hover:bg-muted hover:text-foreground"
              }`
            }
          >
            <item.icon className="w-4 h-4" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3 px-3">
          <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-[#FF6B00]">{user?.name?.charAt(0) || "A"}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <NavLink to="/admin/profile" data-testid="admin-profile-link" className={({ isActive }) => `w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm mb-1 transition-colors ${isActive ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}>
          <ChefHat className="w-4 h-4" />Mon profil
        </NavLink>
        <button
          data-testid="admin-logout-btn"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Deconnexion
        </button>
      </div>
    </aside>
  );
}