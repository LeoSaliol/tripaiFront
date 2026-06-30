"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "./AuthProvider";

export default function Navbar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleLogout() {
    logout();
    setDropdownOpen(false);
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-brand-surface bg-brand-surface/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <span className="text-xl font-bold tracking-tight font-heading">
            <span className="text-brand-light">Trip</span>
            <span className="text-brand-gold">AI</span>
          </span>
        </Link>

        <div className="flex items-center gap-4">
          {!isLoading && isAuthenticated ? (
            <>
              {!isHome && (
                <>
                  <Link
                    href="/dashboard"
                    className="text-sm text-brand-muted hover:text-brand-gold transition-colors"
                  >
                    Mis viajes
                  </Link>
                  <Link
                    href="/generate"
                    className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-medium text-brand-dark hover:brightness-110 transition-all"
                  >
                    Crear mi itinerario
                  </Link>
                </>
              )}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-dark text-sm font-medium text-brand-muted hover:text-brand-gold transition-colors cursor-pointer"
                >
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </button>
                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-lg border border-white/5 bg-brand-surface py-1 shadow-xl">
                    <div className="border-b border-white/5 px-4 py-2">
                      <p className="text-sm font-medium text-brand-light">{user?.name}</p>
                      <p className="text-xs text-brand-muted">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-brand-muted hover:bg-brand-dark hover:text-brand-gold transition-colors"
                    >
                      Editar perfil
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="block px-4 py-2 text-sm text-brand-muted hover:bg-brand-dark hover:text-brand-gold transition-colors"
                    >
                      Mis viajes
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="block w-full px-4 py-2 text-left text-sm text-brand-muted hover:bg-brand-dark hover:text-brand-gold transition-colors"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm text-brand-muted hover:text-brand-gold transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-brand-gold px-4 py-2 text-sm font-medium text-brand-dark hover:brightness-110 transition-all"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
