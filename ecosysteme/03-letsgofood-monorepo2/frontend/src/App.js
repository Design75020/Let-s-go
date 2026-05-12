import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WebSocketProvider } from "./contexts/WebSocketContext";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ClientHome from "./pages/client/ClientHome";
import RestaurantDetail from "./pages/client/RestaurantDetail";
import CartCheckout from "./pages/client/CartCheckout";
import ClientOrders from "./pages/client/ClientOrders";
import LoyaltyPage from "./pages/client/LoyaltyPage";
import OrderTracking from "./pages/client/OrderTracking";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminRestaurants from "./pages/admin/AdminRestaurants";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminDrivers from "./pages/admin/AdminDrivers";
import AdminClients from "./pages/admin/AdminClients";
import AdminPromos from "./pages/admin/AdminPromos";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminDeliverySettings from "./pages/admin/AdminDeliverySettings";
import DriverDashboard from "./pages/driver/DriverDashboard";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import OwnerMenu from "./pages/owner/OwnerMenu";
import OwnerOrders from "./pages/owner/OwnerOrders";
import ProfilePage from "./pages/ProfilePage";
import Sidebar from "./components/layout/Sidebar";
import ClientNav from "./components/layout/ClientNav";
import DriverNav from "./components/layout/DriverNav";
import OwnerLayout from "./components/layout/OwnerLayout";

function ProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return <Outlet />;
}

function AdminLayout() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto"><Outlet /></main>
    </div>
  );
}

function ClientLayout() {
  return (
    <div className="min-h-screen bg-background">
      <ClientNav />
      <main className="pt-[72px]"><Outlet /></main>
    </div>
  );
}

function DriverLayout() {
  return (
    <div className="min-h-screen bg-background">
      <DriverNav />
      <main className="pt-[72px]"><Outlet /></main>
    </div>
  );
}

function RootRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="loading-spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "admin") return <Navigate to="/admin" replace />;
  if (user.role === "driver") return <Navigate to="/driver" replace />;
  if (user.role === "restaurant_owner") return <Navigate to="/owner" replace />;
  return <Navigate to="/home" replace />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <WebSocketProvider>
          <Toaster position="top-right" richColors />
          <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute allowedRoles={["client", "restaurant_owner"]} />}>
              <Route element={<ClientLayout />}>
                <Route path="/home" element={<ClientHome />} />
                <Route path="/restaurant/:id" element={<RestaurantDetail />} />
                <Route path="/cart" element={<CartCheckout />} />
                <Route path="/my-orders" element={<ClientOrders />} />
                <Route path="/order/:orderId" element={<OrderTracking />} />
                <Route path="/loyalty" element={<LoyaltyPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/restaurants" element={<AdminRestaurants />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/drivers" element={<AdminDrivers />} />
                <Route path="/admin/clients" element={<AdminClients />} />
                <Route path="/admin/promos" element={<AdminPromos />} />
                <Route path="/admin/notifications" element={<AdminNotifications />} />
                <Route path="/admin/delivery" element={<AdminDeliverySettings />} />
                <Route path="/admin/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["driver"]} />}>
              <Route element={<DriverLayout />}>
                <Route path="/driver" element={<DriverDashboard />} />
                <Route path="/driver/profile" element={<ProfilePage />} />
              </Route>
            </Route>
            <Route element={<ProtectedRoute allowedRoles={["restaurant_owner"]} />}>
              <Route element={<OwnerLayout />}>
                <Route path="/owner" element={<OwnerDashboard />} />
                <Route path="/owner/menu" element={<OwnerMenu />} />
                <Route path="/owner/orders" element={<OwnerOrders />} />
                <Route path="/owner/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
          </WebSocketProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
