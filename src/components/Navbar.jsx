import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./Button";
import { Logo } from "./Logo";
import { FiMenu, FiX, FiUser } from "react-icons/fi";
import { cn } from "../lib/utils";

export function Navbar({ user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);

  const publicLinks = [
    { name: "Home", href: "/" },
    { name: "How it Works", href: "/#how-it-works" },
    { name: "Mission", href: "/#mission" },
  ];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Logo />
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === link.href
                    ? "text-primary"
                    : "text-neutral-text"
                )}
              >
                {link.name}
              </Link>
            ))}

            {user ? (
              <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
                <span className="text-sm font-medium text-neutral-text">
                  Hi, {user.name}
                </span>
                <Button variant="outline" size="sm" onClick={onLogout}>
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4 border-l pl-6 border-gray-200">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Log in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={toggleMenu}
              className="p-2 rounded-md text-neutral-text hover:bg-gray-100 focus:outline-none"
            >
              {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <div className="px-4 py-3 space-y-1">
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className="block px-3 py-2 rounded-md text-base font-medium text-neutral-text hover:bg-gray-50 hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-100 my-2 pt-2">
              {user ? (
                <>
                  <div className="px-3 py-2 text-base font-medium text-neutral-text">
                    Signed in as {user.name}
                  </div>
                  <Button
                    className="w-full mt-2"
                    variant="outline"
                    onClick={() => {
                      onLogout();
                      setIsOpen(false);
                    }}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Link to="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="ghost" className="w-full justify-center">
                      Log in
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsOpen(false)}>
                    <Button variant="primary" className="w-full justify-center">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
