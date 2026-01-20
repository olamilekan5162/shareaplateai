import { Navbar } from "../components/Navbar";
import { Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export function MainLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={user} onLogout={logout} />
      <main>
        <Outlet />
      </main>
      <footer className="bg-white border-t border-gray-100 py-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 text-center text-neutral-muted text-sm">
          <p>© 2024 ShareAplate AI. Fighting hunger, one plate at a time.</p>
        </div>
      </footer>
    </div>
  );
}
