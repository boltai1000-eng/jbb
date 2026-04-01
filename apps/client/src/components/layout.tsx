import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { BarChart3, Bot, Database, LogOut, MapPinned, Plus } from "lucide-react";
import { useAuth } from "./auth-context";
import { FilterBar } from "./filter-bar";
import { cx } from "../lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3, end: true },
  { to: "/records", label: "Records", icon: Database },
  { to: "/map", label: "Map View", icon: MapPinned },
  { to: "/ai", label: "AI Insights", icon: Bot },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <div className="brand-mark">JBB</div>
          <div className="brand-copy">
            <h1>Tables Dashboard</h1>
            <p>Sales, installs, analytics, and planning</p>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cx("nav-item", isActive && "nav-item-active")
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="primary-button wide" onClick={() => navigate("/sales/new")}>
          <Plus size={16} />
          Add Sale
        </button>

        <div className="sidebar-footer">
          <div>
            <strong>{user?.name}</strong>
            <p>{user?.email}</p>
          </div>
          <button className="ghost-icon" onClick={logout} aria-label="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <div>
            <p className="eyebrow">Overview</p>
            <h2>Sales operations</h2>
          </div>
          <FilterBar />
        </header>
        <Outlet />
      </main>
    </div>
  );
}
