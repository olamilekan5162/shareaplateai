import { useState } from "react";
import { Sidebar } from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { Logo } from "../components/Logo";
import { NotificationBell } from "../components/NotificationBell";
import { useAuth } from "../hooks/useAuth";

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <Sidebar user={user} onLogout={logout} className="hidden md:flex" />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 inset-x-0 h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40">
        <Logo />
        <div className="flex items-center gap-2">
          {user?.role === "recipient" && <NotificationBell />}
          <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
            <FiMenu size={24} className="text-neutral-text" />
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-64 bg-white shadow-xl animate-in slide-in-from-left">
            {/* <div className="flex justify-end items-center p-4 border-b border-gray-100">
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <FiX size={24} className="text-neutral-muted" />
              </button>
            </div> */}
            <Sidebar
              user={user}
              onLogout={logout}
              className="flex border-none h-[calc(100vh-65px)]"
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full md:w-auto mt-5 pt-16 md:pt-0 p-4 md:p-8 overflow-y-auto h-screen">
        <Outlet />
      </main>
    </div>
  );
}
