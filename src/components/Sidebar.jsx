import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";
import { Logo } from "./Logo";
import { useNotifications } from "../hooks/useNotifications";
import {
  FiHome,
  FiList,
  FiPlusCircle,
  FiHeart,
  FiBell,
  FiLogOut,
} from "react-icons/fi";

export function Sidebar({ user, onLogout, className }) {
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const donorLinks = [
    { name: "Overview", href: "/dashboard", icon: FiHome },
    { name: "My Listings", href: "/dashboard/listings", icon: FiList },
    { name: "Add Food", href: "/dashboard/add", icon: FiPlusCircle },
    { name: "Claim Requests", href: "/dashboard/donor-claims", icon: FiBell },
    { name: "Impact", href: "/dashboard/impact", icon: FiHeart },
  ];

  const recipientLinks = [
    { name: "Browse Food", href: "/dashboard", icon: FiHome },
    { name: "My Claims", href: "/dashboard/claims", icon: FiList },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: FiBell,
      badge: unreadCount > 0 ? unreadCount : 0,
    },
  ];

  const volunteerLinks = [
    { name: "Pickup Requests", href: "/dashboard", icon: FiHome },
    { name: "My Pickups", href: "/dashboard/pickups", icon: FiList },
  ];

  let links = [];
  if (user?.role === "donor") links = donorLinks;
  else if (user?.role === "recipient") links = recipientLinks;
  else if (user?.role === "volunteer") links = volunteerLinks;

  return (
    <div
      className={cn(
        "hidden md:flex flex-col w-64 border-r border-gray-100 bg-white h-screen sticky top-0",
        className,
      )}
    >
      <div className="p-6 h-16 flex items-center border-b border-gray-100">
        <Logo />
      </div>

      <div className="flex-1 flex flex-col gap-1 p-4 overflow-y-auto">
        <div className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mb-2 px-3">
          Menu
        </div>
        {links.map((link) => (
          <Link
            key={link.name}
            to={link.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative",
              location.pathname === link.href
                ? "bg-primary/10 text-primary-dark"
                : "text-neutral-text hover:bg-gray-50 hover:text-primary",
            )}
          >
            <link.icon size={18} />
            <span className="flex-1">{link.name}</span>
            {link.badge !== undefined && (
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-bold",
                  link.badge > 0
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-500",
                )}
              >
                {link.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="p-4 border-t border-gray-100">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 mb-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
            {user?.name?.[0] || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-neutral-text truncate">
              {user?.name}
            </p>
            <p className="text-xs text-neutral-muted capitalize">
              {user?.role}
            </p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <FiLogOut size={18} />
          Logout
        </button>
      </div>
    </div>
  );
}
