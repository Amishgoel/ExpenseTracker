import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FiHome, FiTrendingUp, FiTrendingDown, FiLogOut } from "react-icons/fi";
import ThemeToggle from "./ThemeToggle";
import { api } from "../api/axios";

const DashboardLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [me, setMe] = useState(null);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    let mounted = true;
    api
      .get("/auth/me")
      .then((res) => {
        if (!mounted) return;
        setMe(res.data.user);
      })
      .catch(() => {
        // handled by axios 401 interceptor
      });
    return () => {
      mounted = false;
    };
  }, []);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: FiHome },
    { path: "/income", label: "Income", icon: FiTrendingUp },
    { path: "/expense", label: "Expense", icon: FiTrendingDown },
  ];

  const initials = (me?.fullName || me?.email || "U")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      <aside className="w-56 bg-slate-900 dark:bg-slate-950 text-white flex flex-col border-r border-slate-700">
        <div className="p-6 border-b border-slate-700 space-y-4">
          <h1 className="text-xl font-bold">Expense Tracker</h1>
          {me && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-900 flex items-center justify-center font-bold">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{me.fullName || "User"}</p>
                <p className="text-xs text-slate-300 truncate">{me.email}</p>
              </div>
            </div>
          )}
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                location.pathname === path
                  ? "bg-amber-500 text-slate-900"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="p-4 space-y-1 border-t border-slate-700">
          <ThemeToggle className="w-full justify-center text-slate-300 hover:bg-slate-800 hover:text-white dark:hover:bg-slate-800" />
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <FiLogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 p-8 overflow-auto dark:bg-slate-950">{children}</main>
    </div>
  );
};

export default DashboardLayout;
