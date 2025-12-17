import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Film, Home, User, LogOut } from "lucide-react";
import { Link, useLocation } from "wouter";
import { getLoginUrl } from "@/const";
const DEV_BACKEND_URL = import.meta.env.VITE_DEV_BACKEND_URL  ?? "https://pz73vn-3000";

export function Navigation() {
  const { isAuthenticated, logout } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Film className="w-6 h-6 text-blue-500" />
            <span className="font-bold text-lg text-slate-900">Ghibli Movies</span>
          </a>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <Link href="/" className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive("/")
                    ? "bg-blue-50 text-blue-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}>
              <Home className="w-4 h-4" />
              Início
            </Link>

            {isAuthenticated && (
              <Link href="/profile" className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive("/profile")
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-600 hover:text-slate-900"
                  }`}>
                <User className="w-4 h-4" />
                Perfil
              </Link>
            )}

            {/* Auth Buttons */}
            {!isAuthenticated ? (
              import.meta.env.MODE !== "production" ? (
                // In dev, offer a quick dev-login button that hits the backend directly
                <Button
                  onClick={() => {
                    window.location.href = `${DEV_BACKEND_URL}/dev-login`;
                  }}
                  size="sm"
                >
                  Dev Login
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    window.location.href = getLoginUrl();
                  }}
                  size="sm"
                >
                  Entrar
                </Button>
              )
            ) : (
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Sair
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
