import { Routes, Route, Navigate } from "react-router-dom";
import { getUser } from "./lib/api.js";
import Login from "./pages/Login.jsx";
import Layout from "./components/Layout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Leads from "./pages/Leads.jsx";

function Protected({ children }) {
  return getUser() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="leads" element={<Leads />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
