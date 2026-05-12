import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useWebSocket } from "../../contexts/WebSocketContext";
import { ChefHat, LogOut, Bike, Zap } from "lucide-react";

export default function DriverNav() {
  const { user, logout } = useAuth();
  const { connected } = useWebSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header data-testid="driver-nav" className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border h-[72px]">
      <div className="max-w-5xl mx-auto h-full px-4 sm:px-6 flex items-center justify-between">
        <Link to="/driver" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl brand-bg flex items-center justify-center">
            <Bike className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="text-xl brand-text-sm">Let's Go</span>
            <span className="text-xs text-muted-foreground ml-2">Livreur</span>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#10B981]/10">
            <div className={`w-2 h-2 rounded-full ${connected ? "bg-[#10B981] animate-pulse" : "bg-gray-300"}`} />
            <span className={`text-sm font-medium ${connected ? "text-[#10B981]" : "text-muted-foreground"}`}>
              {connected ? "En ligne" : "Hors ligne"}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-[#10B981]">{user?.name?.charAt(0)}</span>
            </div>
            <span className="hidden sm:block text-sm font-medium">{user?.name}</span>
          </div>
          <button
            data-testid="driver-logout-btn"
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
