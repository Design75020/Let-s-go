import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { ShoppingCart, ChefHat, ClipboardList, LogOut, User, Award, Settings } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

export default function ClientNav() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header data-testid="client-nav" className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-[72px]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link to="/home" className="flex items-center gap-2.5" data-testid="client-logo-link">
          <div className="w-9 h-9 rounded-xl brand-bg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl brand-text-sm">Let's Go</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to="/loyalty"
            data-testid="client-loyalty-link"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
          >
            <Award className="w-4 h-4" />
            <span className="hidden sm:inline">Fidelite</span>
          </Link>

          <Link
            to="/my-orders"
            data-testid="client-orders-link"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted transition-colors"
          >
            <ClipboardList className="w-4 h-4" />
            <span className="hidden sm:inline">Mes commandes</span>
          </Link>

          <Link
            to="/cart"
            data-testid="client-cart-link"
            className="relative flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Panier</span>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FF6B00] text-white text-[10px] font-bold flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger data-testid="client-user-menu" className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                <span className="text-xs font-semibold text-[#FF6B00]">{user?.name?.charAt(0)}</span>
              </div>
              <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="gap-2" disabled>
                <User className="w-4 h-4" />
                {user?.email}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem data-testid="client-profile-link" className="gap-2 cursor-pointer" onClick={() => navigate("/profile")}>
                <Settings className="w-4 h-4" />
                Mon profil
              </DropdownMenuItem>
              <DropdownMenuItem data-testid="client-logout-btn" className="gap-2 text-destructive" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
                Deconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
