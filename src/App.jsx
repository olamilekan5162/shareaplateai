import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { MainLayout } from "./layouts/MainLayout";
import { DashboardLayout } from "./layouts/DashboardLayout";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";
import {
  DonorDashboard,
  RecipientDashboard,
  VolunteerDashboard,
  AddListingPage,
  MyListingsPage,
  MyClaimsPage,
  ImpactPage,
} from "./pages/dashboard";
import { NotificationsPage } from "./pages/dashboard/NotificationsPage";
import { DonorClaimsPage } from "./pages/dashboard/DonorClaimsPage";

function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" />;
  }

  return children;
}

function DashboardRouting() {
  const { user } = useAuth();
  if (!user) return null;

  if (user.role === "donor") return <DonorDashboard />;
  if (user.role === "recipient") return <RecipientDashboard />;
  if (user.role === "volunteer") return <VolunteerDashboard />;
  return <div>Unknown role</div>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<LandingPage />} />
          </Route>

          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Protected Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardRouting />} />
            <Route path="add" element={<AddListingPage />} />
            <Route path="listings" element={<MyListingsPage />} />
            <Route path="claims" element={<MyClaimsPage />} />
            <Route path="donor-claims" element={<DonorClaimsPage />} />
            <Route path="impact" element={<ImpactPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            {/* Catch all for dashboard */}
            <Route path="*" element={<Navigate to="/dashboard" />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
