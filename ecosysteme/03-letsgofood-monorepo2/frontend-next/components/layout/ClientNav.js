'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart, ChefHat, ClipboardList, LogOut, User, Award, Settings } from 'lucide-react';

export default function ClientNav() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-[72px]">
      <div className="max-w-7xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link href="/restaurants" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl brand-bg flex items-center justify-center">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl brand-text-sm">Let's Go</span>
        </Link>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <Link
                href="/loyalty"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#F59E0B] hover:bg-[#F59E0B]/10 transition-colors"
              >
                <Award className="w-4 h-4" />
                <span className="hidden sm:inline">Fidélité</span>
              </Link>
              <Link
                href="/my-orders"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-foreground/70 hover:bg-muted transition-colors"
              >
                <ClipboardList className="w-4 h-4" />
                <span className="hidden sm:inline">Mes commandes</span>
              </Link>
            </>
          )}

          <Link
            href="/cart"
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

          {user ? (
            <div className="relative group">
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors cursor-pointer">
                <div className="w-8 h-8 rounded-full bg-[#FF6B00]/10 flex items-center justify-center">
                  <span className="text-xs font-semibold text-[#FF6B00]">{user?.name?.charAt(0)}</span>
                </div>
                <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
              </button>
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <div className="p-2">
                  <div className="flex items-center gap-2 px-3 py-2 text-xs text-muted-foreground">
                    <User className="w-4 h-4" />
                    {user?.email}
                  </div>
                  <hr className="my-1 border-border" />
                  <Link href="/profile" className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors">
                    <Settings className="w-4 h-4" />Mon profil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors text-destructive"
                  >
                    <LogOut className="w-4 h-4" />Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#FF6B00] text-white hover:bg-[#E05E00] transition-colors"
            >
              Se connecter
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
